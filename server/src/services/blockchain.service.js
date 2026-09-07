const { JsonRpcProvider, Wallet, Contract } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.isAvailable = false;
    this.networkName = 'unknown';
    this.chainId = null;
    this.confirmations = 1; // Block confirmations to wait
    
    // Contracts
    this.beekeeperRegistry = null;
    this.honeyBatch = null;
    this.qualityCertification = null;

    this.init();
  }

  async init() {
    try {
      // Default to local Hardhat node if not configured
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
      // Default to Hardhat Account #0 private key (well-known, only for local dev)
      const privateKey = process.env.DEPLOYER_PRIVATE_KEY || '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

      this.provider = new JsonRpcProvider(rpcUrl);
      this.wallet = new Wallet(privateKey, this.provider);
      
      // Detect network
      try {
        const network = await this.provider.getNetwork();
        this.chainId = Number(network.chainId);
        
        if (this.chainId === 80002) {
          this.networkName = 'Polygon Amoy';
          this.confirmations = 3;
        } else if (this.chainId === 137) {
          this.networkName = 'Polygon Mainnet';
          this.confirmations = 5;
        } else if (this.chainId === 43113) {
          this.networkName = 'Avalanche Fuji';
          this.confirmations = 1;
        } else if (this.chainId === 43114) {
          this.networkName = 'Avalanche Mainnet';
          this.confirmations = 3;
        } else if (this.chainId === 1337 || this.chainId === 31337) {
          this.networkName = 'Localhost (Hardhat)';
          this.confirmations = 1;
        } else {
          this.networkName = `Unknown (chainId ${this.chainId})`;
        }
        console.log(`🔗 Blockchain Service: Connected to ${this.networkName} (chainId ${this.chainId})`);
      } catch (netErr) {
        console.warn('⚠️ Blockchain Service: Could not detect network -', netErr.message);
        console.warn('   The app will run in MongoDB-only mode (no on-chain traceability)');
        this.isAvailable = false;
        return;
      }

      this.loadContracts();
    } catch (error) {
      console.warn('⚠️ Blockchain Service: Failed to initialize -', error.message);
      console.warn('   The app will run in MongoDB-only mode (no on-chain traceability)');
      this.isAvailable = false;
    }
  }

  loadContracts() {
    try {
      // Try env vars first, then fall back to deployed-addresses.json
      let regAddress = process.env.BEEKEEPER_REGISTRY_ADDRESS;
      let batchAddress = process.env.HONEY_BATCH_ADDRESS;
      let certAddress = process.env.QUALITY_CERT_ADDRESS;

      if (!regAddress || !batchAddress || !certAddress) {
        // Auto-read from deploy script output
        const addressFile = path.join(__dirname, '../../../blockchain/deployed-addresses.json');
        if (fs.existsSync(addressFile)) {
          const addresses = JSON.parse(fs.readFileSync(addressFile, 'utf8'));
          regAddress = regAddress || addresses.BeekeeperRegistry;
          batchAddress = batchAddress || addresses.HoneyBatch;
          certAddress = certAddress || addresses.QualityCertification;
          console.log('📄 Loaded contract addresses from deployed-addresses.json');
        }
      }

      if (!regAddress || !batchAddress || !certAddress) {
        console.warn('⚠️ Blockchain Service: No contract addresses found. Run: npm run deploy:contracts (local) or npm run deploy:amoy (testnet)');
        this.isAvailable = false;
        return;
      }

      // Human-readable ABIs (ethers v6 interface format)
      const beekeeperABI = [
        "function registerBeekeeper(string kvicId, string name, string location, string ipfsHash) external",
        "function getBeekeeper(uint256 id) public view returns (tuple(uint256 id, string kvicId, string name, string location, string ipfsHash, bool isActive, uint256 registeredAt))",
        "function getBeekeeperCount() public view returns (uint256)",
        "event BeekeeperRegistered(uint256 indexed id, string kvicId, uint256 timestamp)"
      ];
      const batchABI = [
        "function createBatch(string batchCode, uint256 beekeeperId, string floralSource, uint256 quantity, uint256 harvestTimestamp) external returns (uint256)",
        "function updateStatus(uint256 batchId, uint8 newStatus, string notes) external",
        "function certifyBatch(uint256 batchId, string certIpfsHash, bool passed) external",
        "function getBatch(uint256 batchId) public view returns (tuple(uint256 id, string batchCode, uint256 beekeeperId, string floralSource, uint256 quantity, uint256 harvestTimestamp, uint8 status, string certIpfsHash, bool isCertified, uint256 createdAt, uint256 updatedAt))",
        "function getBatchCount() public view returns (uint256)",
        "event BatchCreated(uint256 indexed id, string batchCode, uint256 indexed beekeeperId, uint256 timestamp)",
        "event BatchStatusUpdated(uint256 indexed batchId, uint8 oldStatus, uint8 newStatus, address indexed updatedBy, uint256 timestamp)"
      ];
      const certABI = [
        "function submitCertification(uint256 batchId, uint256 moisture, uint256 hmf, uint256 diastase, bool passed, string reportIpfsHash) external",
        "function getCertification(uint256 batchId) public view returns (tuple(uint256 batchId, address labTester, uint256 moisture, uint256 hmf, uint256 diastase, bool passed, string reportIpfsHash, uint256 timestamp))",
        "function hasCertification(uint256 batchId) public view returns (bool)",
        "event CertificationSubmitted(uint256 indexed batchId, address indexed labTester, bool passed, uint256 timestamp)"
      ];

      this.beekeeperRegistry = new Contract(regAddress, beekeeperABI, this.wallet);
      this.honeyBatch = new Contract(batchAddress, batchABI, this.wallet);
      this.qualityCertification = new Contract(certAddress, certABI, this.wallet);
      this.isAvailable = true;
      console.log(`✅ Blockchain Service Initialized — contracts connected on ${this.networkName}`);
    } catch (err) {
      console.warn('⚠️ Blockchain Service: Failed to load contracts -', err.message);
      this.isAvailable = false;
    }
  }

  isBlockchainAvailable() { return this.isAvailable; }
  getNetworkName() { return this.networkName; }
  getChainId() { return this.chainId; }

  /**
   * Retry helper with exponential backoff for testnet reliability.
   * Public RPCs can be flaky — this retries up to 3 times.
   */
  async _withRetry(fn, label = 'transaction') {
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (attempt === MAX_RETRIES) throw err;
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.warn(`⚠️ ${label} attempt ${attempt} failed: ${err.message}. Retrying in ${delay/1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  // ═══════════════════════════════════════════
  // BEEKEEPER REGISTRY
  // ═══════════════════════════════════════════

  async registerBeekeeperOnChain(kvicId, name, location, ipfsHash) {
    if (!this.isAvailable) return { success: true, txHash: null, blockchainId: null };
    try {
      return await this._withRetry(async () => {
        const locationStr = typeof location === 'string' ? location : JSON.stringify(location);
        const tx = await this.beekeeperRegistry.registerBeekeeper(kvicId, name, locationStr, ipfsHash || "");
        await tx.wait(this.confirmations);
        const count = await this.beekeeperRegistry.getBeekeeperCount();
        console.log(`🐝 Beekeeper registered on-chain: ID=${count}, txHash=${tx.hash}`);
        return { success: true, txHash: tx.hash, blockchainId: Number(count) };
      }, 'registerBeekeeper');
    } catch (err) {
      console.error('Blockchain error (registerBeekeeper):', err.message);
      return { success: false, txHash: null, blockchainId: null, error: err.message };
    }
  }

  // ═══════════════════════════════════════════
  // HONEY BATCH
  // ═══════════════════════════════════════════

  async createBatchOnChain(batchCode, beekeeperBlockchainId, floralSource, quantity, harvestTimestamp) {
    if (!this.isAvailable) return { success: true, txHash: null, blockchainBatchId: null };
    try {
      return await this._withRetry(async () => {
        const tx = await this.honeyBatch.createBatch(
          batchCode,
          beekeeperBlockchainId || 0,
          floralSource,
          Math.floor(quantity),
          Math.floor(new Date(harvestTimestamp).getTime() / 1000)
        );
        await tx.wait(this.confirmations);
        const count = await this.honeyBatch.getBatchCount();
        console.log(`📦 Batch created on-chain: ID=${count}, txHash=${tx.hash}`);
        return { success: true, txHash: tx.hash, blockchainBatchId: Number(count) };
      }, 'createBatch');
    } catch (err) {
      console.error('Blockchain error (createBatch):', err.message);
      return { success: false, txHash: null, blockchainBatchId: null, error: err.message };
    }
  }

  async updateBatchStatusOnChain(blockchainBatchId, newStatus, notes) {
    if (!this.isAvailable || !blockchainBatchId) return { success: true, txHash: null };
    
    const statusMap = {
      'HARVESTED': 0, 'SUBMITTED_FOR_TEST': 1, 'TESTING': 2, 'CERTIFIED': 3,
      'REJECTED': 4, 'PACKAGED': 5, 'DISPATCHED': 6, 'DELIVERED': 7
    };
    
    try {
      return await this._withRetry(async () => {
        const tx = await this.honeyBatch.updateStatus(blockchainBatchId, statusMap[newStatus], notes || "");
        await tx.wait(this.confirmations);
        console.log(`📋 Batch #${blockchainBatchId} status → ${newStatus}, txHash=${tx.hash}`);
        return { success: true, txHash: tx.hash };
      }, 'updateBatchStatus');
    } catch (err) {
      console.error('Blockchain error (updateStatus):', err.message);
      return { success: false, txHash: null, error: err.message };
    }
  }

  async certifyBatchOnChain(blockchainBatchId, certHash, passed) {
    if (!this.isAvailable || !blockchainBatchId) return { success: true, txHash: null };
    try {
      return await this._withRetry(async () => {
        const tx = await this.honeyBatch.certifyBatch(blockchainBatchId, certHash || "", passed);
        await tx.wait(this.confirmations);
        console.log(`🏅 Batch #${blockchainBatchId} ${passed ? 'CERTIFIED' : 'REJECTED'} on-chain, txHash=${tx.hash}`);
        return { success: true, txHash: tx.hash };
      }, 'certifyBatch');
    } catch (err) {
      console.error('Blockchain error (certifyBatch):', err.message);
      return { success: false, txHash: null, error: err.message };
    }
  }

  // ═══════════════════════════════════════════
  // QUALITY CERTIFICATION
  // ═══════════════════════════════════════════

  async submitCertificationOnChain(blockchainBatchId, moisture, hmf, diastase, passed, reportHash) {
    if (!this.isAvailable || !blockchainBatchId) return { success: true, txHash: null };
    try {
      return await this._withRetry(async () => {
        const tx = await this.qualityCertification.submitCertification(
          blockchainBatchId,
          Math.floor(moisture * 100),
          Math.floor(hmf * 100),
          Math.floor(diastase * 100),
          passed,
          reportHash || ""
        );
        await tx.wait(this.confirmations);
        console.log(`🧪 Certification submitted on-chain for batch #${blockchainBatchId}, txHash=${tx.hash}`);
        return { success: true, txHash: tx.hash };
      }, 'submitCertification');
    } catch (err) {
      console.error('Blockchain error (submitCertification):', err.message);
      return { success: false, txHash: null, error: err.message };
    }
  }

  // ═══════════════════════════════════════════
  // READ / VERIFY (for consumer verification)
  // ═══════════════════════════════════════════

  async getBatchFromChain(blockchainBatchId) {
    if (!this.isAvailable || !blockchainBatchId) return null;
    try {
      const batch = await this.honeyBatch.getBatch(blockchainBatchId);
      return {
        id: Number(batch.id),
        batchCode: batch.batchCode,
        beekeeperId: Number(batch.beekeeperId),
        floralSource: batch.floralSource,
        quantity: Number(batch.quantity),
        harvestTimestamp: Number(batch.harvestTimestamp),
        status: Number(batch.status),
        certIpfsHash: batch.certIpfsHash,
        isCertified: batch.isCertified,
        createdAt: Number(batch.createdAt),
        updatedAt: Number(batch.updatedAt)
      };
    } catch (err) {
      console.error('Blockchain read error (getBatch):', err.message);
      return null;
    }
  }

  async getCertificationFromChain(blockchainBatchId) {
    if (!this.isAvailable || !blockchainBatchId) return null;
    try {
      const hasCert = await this.qualityCertification.hasCertification(blockchainBatchId);
      if (!hasCert) return null;
      const cert = await this.qualityCertification.getCertification(blockchainBatchId);
      return {
        batchId: Number(cert.batchId),
        labTester: cert.labTester,
        moisture: Number(cert.moisture) / 100,
        hmf: Number(cert.hmf) / 100,
        diastase: Number(cert.diastase) / 100,
        passed: cert.passed,
        reportIpfsHash: cert.reportIpfsHash,
        timestamp: Number(cert.timestamp)
      };
    } catch (err) {
      console.error('Blockchain read error (getCertification):', err.message);
      return null;
    }
  }
}

module.exports = new BlockchainService();
