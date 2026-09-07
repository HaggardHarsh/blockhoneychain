const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  if (network !== "amoy") {
    console.error("❌ This script is for Polygon Amoy only. Use: npx hardhat run scripts/deploy-amoy.js --network amoy");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  
  console.log("\n🔷 Deploying to Polygon Amoy Testnet");
  console.log("═══════════════════════════════════════");
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "POL");
  
  if (balance === 0n) {
    console.error("\n❌ No POL balance! Get free tokens from https://faucet.polygon.technology/");
    process.exit(1);
  }

  const CONFIRMATIONS = 5; // Wait for 5 blocks for PolygonScan indexing
  const contracts = {};

  // Skip BeekeeperRegistry (Already deployed)
  console.log("\n📦 Skipping BeekeeperRegistry (Already deployed)...");
  const beekeeperRegistryAddress = "0x1Dc233c82c49595374b36B43Eed60aF5AD40C166";
  contracts.BeekeeperRegistry = beekeeperRegistryAddress;
  console.log("  ✅ BeekeeperRegistry:", beekeeperRegistryAddress);

  // Skip HoneyBatch (Already deployed)
  console.log("\n📦 Skipping HoneyBatch (Already deployed)...");
  const honeyBatchAddress = "0x7F99b782F6848CC1e99B978e40a53a4A4c09Cdd3";
  contracts.HoneyBatch = honeyBatchAddress;
  console.log("  ✅ HoneyBatch:", honeyBatchAddress);

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
  console.log("  🔗 https://amoy.polygonscan.com/address/" + qualityCertificationAddress);

  // Save deployed addresses
  const addresses = {
    ...contracts,
    deployedAt: new Date().toISOString(),
    network: "amoy",
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
  console.log(`BLOCKCHAIN_RPC_URL=https://polygon-amoy-bor-rpc.publicnode.com`);
  console.log(`DEPLOYER_PRIVATE_KEY=${process.env.PRIVATE_KEY}`);
  console.log(`BEEKEEPER_REGISTRY_ADDRESS=${contracts.BeekeeperRegistry}`);
  console.log(`HONEY_BATCH_ADDRESS=${contracts.HoneyBatch}`);
  console.log(`QUALITY_CERT_ADDRESS=${contracts.QualityCertification}`);

  // Verify contracts on PolygonScan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\n🔍 Verifying contracts on PolygonScan...");
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
    console.log("\n💡 Tip: Set POLYGONSCAN_API_KEY in blockchain/.env to auto-verify contracts");
  }

  // Final balance
  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  const cost = balance - finalBalance;
  console.log("\n═══════════════════════════════════════");
  console.log("🚀 Deployment complete!");
  console.log("💰 Total cost:", hre.ethers.formatEther(cost), "POL");
  console.log("💰 Remaining balance:", hre.ethers.formatEther(finalBalance), "POL");
  console.log("═══════════════════════════════════════\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
