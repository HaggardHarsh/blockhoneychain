const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();
  console.log(`\nDeploying contracts to ${network} with account:`, deployer.address);

  // Deploy BeekeeperRegistry
  const BeekeeperRegistry = await hre.ethers.getContractFactory("BeekeeperRegistry");
  const beekeeperRegistry = await BeekeeperRegistry.deploy();
  await beekeeperRegistry.waitForDeployment();
  const beekeeperRegistryAddress = await beekeeperRegistry.getAddress();
  console.log("✅ BeekeeperRegistry deployed to:", beekeeperRegistryAddress);

  // Deploy HoneyBatch
  const HoneyBatch = await hre.ethers.getContractFactory("HoneyBatch");
  const honeyBatch = await HoneyBatch.deploy();
  await honeyBatch.waitForDeployment();
  const honeyBatchAddress = await honeyBatch.getAddress();
  console.log("✅ HoneyBatch deployed to:", honeyBatchAddress);

  // Deploy QualityCertification
  const QualityCertification = await hre.ethers.getContractFactory("QualityCertification");
  const qualityCertification = await QualityCertification.deploy();
  await qualityCertification.waitForDeployment();
  const qualityCertificationAddress = await qualityCertification.getAddress();
  console.log("✅ QualityCertification deployed to:", qualityCertificationAddress);

  // Save addresses to JSON (for server auto-read)
  const addresses = {
    BeekeeperRegistry: beekeeperRegistryAddress,
    HoneyBatch: honeyBatchAddress,
    QualityCertification: qualityCertificationAddress,
    deployedAt: new Date().toISOString(),
    network: network,
    deployer: deployer.address
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log(`\n📄 Saved addresses to ${outputPath}`);

  // Show explorer links for Amoy
  if (network === "amoy") {
    console.log("\n🔗 View on PolygonScan:");
    console.log(`   BeekeeperRegistry: https://amoy.polygonscan.com/address/${beekeeperRegistryAddress}`);
    console.log(`   HoneyBatch:        https://amoy.polygonscan.com/address/${honeyBatchAddress}`);
    console.log(`   QualityCertification: https://amoy.polygonscan.com/address/${qualityCertificationAddress}`);
  }

  console.log("\n🚀 All contracts deployed successfully! You can now start the server.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
