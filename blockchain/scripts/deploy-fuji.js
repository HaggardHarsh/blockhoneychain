const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  if (network !== "fuji") {
    console.error("❌ This script is for Avalanche Fuji only. Use: npm run deploy:fuji");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("\n🔷 Deploying to Avalanche Fuji Testnet");
  console.log("═══════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "AVAX");
  
  if (balance === 0n) {
    console.error("\n❌ No AVAX balance! Get free tokens from https://faucet.avax.network/");
    process.exit(1);
  }

  const CONFIRMATIONS = 5; // Wait for 5 blocks for Snowtrace indexing
  const contracts = {};

  // Deploy BeekeeperRegistry
  console.log("\n📦 Deploying BeekeeperRegistry...");
  const BeekeeperRegistry = await hre.ethers.getContractFactory("BeekeeperRegistry");
  const beekeeperRegistry = await BeekeeperRegistry.deploy();
  await beekeeperRegistry.waitForDeployment();
  const beekeeperRegistryAddress = await beekeeperRegistry.getAddress();
  console.log("  Waiting for", CONFIRMATIONS, "confirmations...");
  await beekeeperRegistry.deploymentTransaction().wait(CONFIRMATIONS);
  contracts.BeekeeperRegistry = beekeeperRegistryAddress;
  console.log("  ✅ BeekeeperRegistry:", beekeeperRegistryAddress);
  console.log("  🔗 https://testnet.snowtrace.io/address/" + beekeeperRegistryAddress);

  // Deploy HoneyBatch
  console.log("\n📦 Deploying HoneyBatch...");
  const HoneyBatch = await hre.ethers.getContractFactory("HoneyBatch");
  const honeyBatch = await HoneyBatch.deploy();
  await honeyBatch.waitForDeployment();
  const honeyBatchAddress = await honeyBatch.getAddress();
  console.log("  Waiting for", CONFIRMATIONS, "confirmations...");
  await honeyBatch.deploymentTransaction().wait(CONFIRMATIONS);
  contracts.HoneyBatch = honeyBatchAddress;
  console.log("  ✅ HoneyBatch:", honeyBatchAddress);
  console.log("  🔗 https://testnet.snowtrace.io/address/" + honeyBatchAddress);

  // Deploy QualityCertification
  console.log("\n📦 Deploying QualityCertification...");
  const QualityCertification = await hre.ethers.getContractFactory("QualityCertification");
  const qualityCertification = await QualityCertification.deploy();
  await qualityCertification.waitForDeployment();
  const qualityCertificationAddress = await qualityCertification.getAddress();
  console.log("  Waiting for", CONFIRMATIONS, "confirmations...");
  await qualityCertification.deploymentTransaction().wait(CONFIRMATIONS);
  contracts.QualityCertification = qualityCertificationAddress;
  console.log("  ✅ QualityCertification:", qualityCertificationAddress);
  console.log("  🔗 https://testnet.snowtrace.io/address/" + qualityCertificationAddress);

  // Save deployed addresses
  const addresses = {
    ...contracts,
    deployedAt: new Date().toISOString(),
    network: "fuji",
    chainId: 80002,
    deployer: deployer.address
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("\n📄 Saved addresses to deployed-addresses.json");

  // Print env vars for server
  console.log("\n═══════════════════════════════════════");
  console.log("📋 Copy these to your server/.env:");
  console.log("═══════════════════════════════════════");
  console.log(`BLOCKCHAIN_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc`);
  console.log(`DEPLOYER_PRIVATE_KEY=${process.env.PRIVATE_KEY}`);
  console.log(`BEEKEEPER_REGISTRY_ADDRESS=${contracts.BeekeeperRegistry}`);
  console.log(`HONEY_BATCH_ADDRESS=${contracts.HoneyBatch}`);
  console.log(`QUALITY_CERT_ADDRESS=${contracts.QualityCertification}`);

  // Verify contracts on Snowtrace
  if (process.env.Snowtrace_API_KEY) {
    console.log("\n🔍 Verifying contracts on Snowtrace...");
    for (const [name, address] of Object.entries(contracts)) {
      try {
        console.log(`  Verifying ${name}...`);
        await hre.run("verify:verify", { address, constructorArguments: [] });
        console.log(`  ✅ ${name} verified!`);
      } catch (err) {
        if (err.message.includes("Already Verified")) {
          console.log(`  ✅ ${name} already verified`);
        } else {
          console.warn(`  ⚠️ ${name} verification failed:`, err.message);
        }
      }
    }
  } else {
    console.log("\n💡 Tip: Set SNOWTRACE_API_KEY in blockchain/.env to auto-verify contracts");
  }

  // Final balance
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const cost = balance - finalBalance;
  console.log("\n═══════════════════════════════════════");
  console.log("🚀 Deployment complete!");
  console.log("💰 Total cost:", hre.ethers.formatEther(cost), "AVAX");
  console.log("💰 Remaining balance:", hre.ethers.formatEther(finalBalance), "AVAX");
  console.log("═══════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
