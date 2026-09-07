const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("HoneyChain", function () {
  let beekeeperRegistry;
  let honeyBatch;
  let qualityCertification;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    const BeekeeperRegistry = await ethers.getContractFactory("BeekeeperRegistry");
    beekeeperRegistry = await BeekeeperRegistry.deploy();

    const HoneyBatch = await ethers.getContractFactory("HoneyBatch");
    honeyBatch = await HoneyBatch.deploy();

    const QualityCertification = await ethers.getContractFactory("QualityCertification");
    qualityCertification = await QualityCertification.deploy();
  });

  describe("BeekeeperRegistry", function () {
    it("Should register, update, get and deactivate a beekeeper", async function () {
      await beekeeperRegistry.registerBeekeeper("KVIC123", "John Doe", "Apiary A", "QmHash1");
      
      let beekeeper = await beekeeperRegistry.getBeekeeper(1);
      expect(beekeeper.name).to.equal("John Doe");

      await beekeeperRegistry.updateBeekeeper(1, "QmHash2");
      beekeeper = await beekeeperRegistry.getBeekeeper(1);
      expect(beekeeper.ipfsHash).to.equal("QmHash2");

      await beekeeperRegistry.deactivateBeekeeper(1);
      beekeeper = await beekeeperRegistry.getBeekeeper(1);
      expect(beekeeper.isActive).to.be.false;
      
      expect(await beekeeperRegistry.getBeekeeperCount()).to.equal(1);
    });
  });

  describe("HoneyBatch", function () {
    it("Should create a batch and go through valid status transitions", async function () {
      await honeyBatch.createBatch("BATCH1", 1, "Clover", 100, Math.floor(Date.now() / 1000));
      let batch = await honeyBatch.getBatch(1);
      expect(batch.status).to.equal(0); // Harvested

      await honeyBatch.updateStatus(1, 1, "Sent to lab"); // SubmittedForTest
      batch = await honeyBatch.getBatch(1);
      expect(batch.status).to.equal(1);

      await honeyBatch.updateStatus(1, 2, "Testing started"); // Testing
      batch = await honeyBatch.getBatch(1);
      expect(batch.status).to.equal(2);

      await honeyBatch.certifyBatch(1, "QmCert", true); // Certified
      batch = await honeyBatch.getBatch(1);
      expect(batch.status).to.equal(3);
      expect(batch.isCertified).to.be.true;
    });

    it("Should prevent invalid status transitions", async function () {
      await honeyBatch.createBatch("BATCH2", 1, "Clover", 100, Math.floor(Date.now() / 1000));
      
      // Try to jump from Harvested to Certified
      await expect(honeyBatch.updateStatus(1, 3, "Invalid jump"))
        .to.be.revertedWith("Invalid status transition");
    });
  });

  describe("QualityCertification", function () {
    it("Should submit a certification and prevent duplicates", async function () {
      await qualityCertification.submitCertification(1, 185, 30, 10, true, "QmReport");
      
      const cert = await qualityCertification.getCertification(1);
      expect(cert.passed).to.be.true;
      expect(cert.moisture).to.equal(185);

      expect(await qualityCertification.hasCertification(1)).to.be.true;

      await expect(qualityCertification.submitCertification(1, 190, 30, 10, false, "QmReport2"))
        .to.be.revertedWith("Certification already submitted");
    });
  });
});
