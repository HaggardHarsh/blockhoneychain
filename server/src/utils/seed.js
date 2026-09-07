const mongoose = require('mongoose');
const User = require('../models/User.model');
const Beekeeper = require('../models/Beekeeper.model');
const Hive = require('../models/Hive.model');
const HoneyBatch = require('../models/HoneyBatch.model');
const QualityTest = require('../models/QualityTest.model');
const blockchainService = require('../services/blockchain.service');
const qrService = require('../services/qr.service');

async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial data...');
    const admin = await User.create({ email: 'admin@honeychain.com', phone: '9999999999', password: 'admin123', fullName: 'KVIC Admin', role: 'ADMIN', isApproved: true });
    const tester = await User.create({ email: 'lab@honeychain.com', phone: '8888888888', password: 'lab123', fullName: 'Dr. Priya Sharma', role: 'LAB_TESTER', isApproved: true });
    
    // Seed 3 beekeepers
    const u1 = await User.create({ email: 'ram@honeychain.com', phone: '1111111111', password: 'user123', fullName: 'Ram Prasad Sharma', role: 'BEEKEEPER', isApproved: true, isEmailVerified: true });
    const u2 = await User.create({ email: 'lakshmi@honeychain.com', phone: '2222222222', password: 'user123', fullName: 'Lakshmi Devi', role: 'BEEKEEPER', isApproved: true, isEmailVerified: true });
    const u3 = await User.create({ email: 'mohan@honeychain.com', phone: '3333333333', password: 'user123', fullName: 'Mohan Singh', role: 'BEEKEEPER', isApproved: true, isEmailVerified: true });

    const b1 = await Beekeeper.create({ user: u1._id, fullName: 'Ram Prasad Sharma', phone: '1111111111', aadhaarLast4: '1234', address: { village: 'Vil1', district: 'Rampur', state: 'UP', pincode: '244901' }, kvicRegistrationId: 'KVIC-UP-2024-0042', location: { type: 'Point', coordinates: [79.0, 28.0] }, numberOfBeeBoxes: 12, floralSources: ['Mustard', 'Litchi'], status: 'APPROVED' });
    const b2 = await Beekeeper.create({ user: u2._id, fullName: 'Lakshmi Devi', phone: '2222222222', aadhaarLast4: '5678', address: { village: 'Vil2', district: 'Pune', state: 'MH', pincode: '411001' }, kvicRegistrationId: 'KVIC-MH-2024-0108', location: { type: 'Point', coordinates: [73.8, 18.5] }, numberOfBeeBoxes: 8, floralSources: ['Jamun', 'Multifloral'], status: 'APPROVED' });
    const b3 = await Beekeeper.create({ user: u3._id, fullName: 'Mohan Singh', phone: '3333333333', aadhaarLast4: '9012', address: { village: 'Vil3', district: 'Jaipur', state: 'RJ', pincode: '302001' }, kvicRegistrationId: 'KVIC-RJ-2024-0073', location: { type: 'Point', coordinates: [75.7, 26.9] }, numberOfBeeBoxes: 15, floralSources: ['Multifloral', 'Eucalyptus'], status: 'APPROVED' });

    // Register beekeepers on blockchain
    if (blockchainService.isBlockchainAvailable()) {
      console.log('🔗 Registering beekeepers on blockchain...');
      for (const bk of [b1, b2, b3]) {
        const tx = await blockchainService.registerBeekeeperOnChain(
          bk.kvicRegistrationId, bk.fullName, JSON.stringify(bk.address), ''
        );
        if (tx.success && tx.blockchainId) {
          bk.blockchainId = tx.blockchainId;
          bk.blockchainTxHash = tx.txHash;
          await bk.save();
        }
      }
    } else {
      console.log('⚠️ Blockchain not available — seed beekeepers without on-chain registration');
    }

    // Seed 2 hives per beekeeper
    const h1 = await Hive.create({ hiveCode: 'HV-UP-1', beekeeper: b1._id, locationName: 'Farm 1', floralSource: 'Mustard' });
    const h2 = await Hive.create({ hiveCode: 'HV-UP-2', beekeeper: b1._id, locationName: 'Farm 2', floralSource: 'Litchi' });
    const h3 = await Hive.create({ hiveCode: 'HV-MH-1', beekeeper: b2._id, locationName: 'Farm 1', floralSource: 'Jamun' });
    const h4 = await Hive.create({ hiveCode: 'HV-MH-2', beekeeper: b2._id, locationName: 'Farm 2', floralSource: 'Multifloral' });
    const h5 = await Hive.create({ hiveCode: 'HV-RJ-1', beekeeper: b3._id, locationName: 'Farm 1', floralSource: 'Multifloral' });
    const h6 = await Hive.create({ hiveCode: 'HV-RJ-2', beekeeper: b3._id, locationName: 'Farm 2', floralSource: 'Eucalyptus' });

    // Seed batches — register each on blockchain too
    const seedBatches = [
      { code: 'BAT-1001', bk: b1, hives: [h1._id], floral: 'Mustard', qty: 20, status: 'HARVESTED', history: ['HARVESTED'] },
      { code: 'BAT-1002', bk: b1, hives: [h2._id], floral: 'Litchi', qty: 15, status: 'SUBMITTED_FOR_TEST', history: ['HARVESTED', 'SUBMITTED_FOR_TEST'] },
      { code: 'BAT-1003', bk: b2, hives: [h3._id], floral: 'Jamun', qty: 10, status: 'CERTIFIED', history: ['HARVESTED', 'SUBMITTED_FOR_TEST', 'TESTING', 'CERTIFIED'] },
      { code: 'BAT-1004', bk: b2, hives: [h4._id], floral: 'Multifloral', qty: 25, status: 'PACKAGED', history: ['HARVESTED', 'SUBMITTED_FOR_TEST', 'TESTING', 'CERTIFIED', 'PACKAGED'] },
      { code: 'BAT-1005', bk: b3, hives: [h5._id, h6._id], floral: 'Multifloral', qty: 40, status: 'DELIVERED', history: ['HARVESTED', 'SUBMITTED_FOR_TEST', 'TESTING', 'CERTIFIED', 'PACKAGED', 'DISPATCHED', 'DELIVERED'] },
    ];

    const createdBatches = [];
    for (const sb of seedBatches) {
      let blockchainBatchId = null;
      let blockchainTxHash = null;

      if (blockchainService.isBlockchainAvailable()) {
        // Create batch on-chain
        const createTx = await blockchainService.createBatchOnChain(
          sb.code, sb.bk.blockchainId || 0, sb.floral, sb.qty, new Date()
        );
        blockchainBatchId = createTx.blockchainBatchId;
        blockchainTxHash = createTx.txHash;

        // Walk through the status transitions on-chain
        if (blockchainBatchId) {
          for (let i = 1; i < sb.history.length; i++) {
            const st = sb.history[i];
            // Skip CERTIFIED/REJECTED — handled via certifyBatch
            if (st === 'CERTIFIED' || st === 'REJECTED') {
              await blockchainService.certifyBatchOnChain(blockchainBatchId, '', st === 'CERTIFIED');
            } else {
              await blockchainService.updateBatchStatusOnChain(blockchainBatchId, st, 'Seed data');
            }
          }
        }
      }

      const qrCodeUrl = await qrService.generateQRCode(sb.code);

      const bat = await HoneyBatch.create({
        batchCode: sb.code, beekeeper: sb.bk._id, hives: sb.hives, floralSource: sb.floral,
        harvestDate: new Date(), rawQuantityKg: sb.qty, status: sb.status,
        blockchainBatchId, blockchainTxHash,
        statusHistory: sb.history.map(s => ({ status: s, timestamp: new Date(), txHash: blockchainTxHash })),
        qrCodeUrl: qrCodeUrl
      });
      createdBatches.push(bat);
    }

    // Seed Quality test results
    const paramResults = {
      moisture: { value: 18, pass: true },
      hmf: { value: 20, pass: true },
      diastaseActivity: { value: 12, pass: true },
      reducingSugars: { value: 70, pass: true },
      sucrose: { value: 3, pass: true },
      fructoseGlucoseRatio: { value: 1.2, pass: true },
      c4Sugars: { value: 2, pass: true },
      fiehesTest: { value: 'Negative', pass: true },
      heavyMetals: { lead: { value: 1.0, pass: true }, arsenic: { value: 0.5, pass: true } },
      antibioticResidues: { detected: false, pass: true }
    };

    const crypto = require('crypto');
    // Batches 3, 4, 5 (indices 2, 3, 4) have quality tests
    for (let i = 2; i < 5; i++) {
      const bat = createdBatches[i];
      const qt = await QualityTest.create({
        batch: bat._id, labName: 'KVIC Central Lab',
        reportNumber: `RPT-00${i - 1}`, parameters: paramResults,
        overallResult: 'PASS', testedBy: tester._id
      });
      bat.qualityTest = qt._id;
      await bat.save();

      // Submit certification on-chain
      if (blockchainService.isBlockchainAvailable() && bat.blockchainBatchId) {
        const dataString = `${bat._id}-KVIC Central Lab-18-20-12-true`;
        const realHash = crypto.createHash('sha256').update(dataString).digest('hex');
        
        await blockchainService.submitCertificationOnChain(
          bat.blockchainBatchId, 18, 20, 12, true, realHash
        );
      }
    }

    console.log('✅ Database seeded successfully');
    console.log('Admin login: admin@honeychain.com / admin123');
    console.log('Lab login: lab@honeychain.com / lab123');
    console.log('Beekeeper login: ram@honeychain.com / user123');
    if (blockchainService.isBlockchainAvailable()) {
      console.log('🔗 All seed data registered on blockchain');
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = { seedDatabase };
