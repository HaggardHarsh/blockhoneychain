const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const QualityTest = require('../models/QualityTest.model');
const HoneyBatch = require('../models/HoneyBatch.model');
const blockchainService = require('../services/blockchain.service');
const ocrService = require('../services/ocr.service');
const { protect, authorize } = require('../middleware/auth.middleware');

// AI-powered lab report extraction endpoint
router.post('/extract-report', protect, authorize('LAB_TESTER'), async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ success: false, message: 'No image provided' });

    const extracted = await ocrService.extractLabReport(image);
    res.json({ success: true, data: extracted });
  } catch (err) {
    console.error('OCR extraction error:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Failed to extract data from report' });
  }
});

router.post('/test', protect, authorize('LAB_TESTER'), async (req, res, next) => {
  try {
    const { batchId, labName, reportNumber, parameters, remarks, labReportImage } = req.body;
    const paramResults = {
      reducingSugar: { value: parameters.reducingSugar, pass: parameters.reducingSugar >= 65 },
      sucrose: { value: parameters.sucrose, pass: parameters.sucrose <= 5 },
      moisture: { value: parameters.moisture, pass: parameters.moisture <= 20 },
      ash: { value: parameters.ash, pass: parameters.ash <= 0.5 },
      fiehesTest: { value: parameters.fiehesTest, pass: parameters.fiehesTest === 'Negative' },
      hmf: { value: parameters.hmf, pass: parameters.hmf <= 80 },
      fgRatio: { value: parameters.fgRatio, pass: parameters.fgRatio >= 0.95 && parameters.fgRatio <= 1.50 },
      specificGravity: { value: parameters.specificGravity, pass: parameters.specificGravity >= 1.35 },
      acidity: { value: parameters.acidity, pass: parameters.acidity <= 0.20 },
      proline: { value: parameters.proline, pass: parameters.proline >= 180 }
    };

    let overallPassed = Object.values(paramResults).every(p => p.pass);

    const qt = await QualityTest.create({
      batch: batchId, labName, reportNumber, parameters: paramResults,
      overallResult: overallPassed ? 'PASS' : 'FAIL', remarks, testedBy: req.user._id,
      labReportImage: labReportImage || null
    });

    const batch = await HoneyBatch.findById(batchId);
    batch.qualityTest = qt._id;
    batch.status = overallPassed ? 'CERTIFIED' : 'REJECTED';

    const dataString = batchId + '-' + labName + '-' + parameters.moisture + '-' + parameters.hmf + '-' + parameters.sucrose + '-' + overallPassed;
    const reportDataHash = crypto.createHash('sha256').update(dataString).digest('hex');

    if (blockchainService.isBlockchainAvailable() && batch.blockchainBatchId) {
      // 0. The smart contract requires the batch to be in the TESTING state before certifying.
      if (batch.status === 'SUBMITTED_FOR_TEST') {
        await blockchainService.updateBatchStatusOnChain(batch.blockchainBatchId, 'TESTING', 'Lab began analysis');
      }

      // 1. Certify the batch on the HoneyBatch contract (stores hash + pass/fail)
      const batchCertTx = await blockchainService.certifyBatchOnChain(batch.blockchainBatchId, reportDataHash, overallPassed);
      if (batchCertTx.success) qt.blockchainTxHash = batchCertTx.txHash;

      // 2. Submit detailed test parameters to the QualityCertification contract
      //    This writes actual FSSAI values (moisture, HMF, proline) on-chain for full transparency
      const certDetailTx = await blockchainService.submitCertificationOnChain(
        batch.blockchainBatchId,
        parameters.moisture,
        parameters.hmf,
        parameters.proline,   // using diastase slot for proline (FSSAI parameter)
        overallPassed,
        reportDataHash
      );
      if (certDetailTx.success) {
        qt.certificationTxHash = certDetailTx.txHash;
        console.log(`🧪 Quality cert written to chain: ${certDetailTx.txHash}`);
      }
    }
    
    await qt.save();

    batch.statusHistory.push({
      status: batch.status,
      timestamp: new Date(),
      updatedBy: req.user._id,
      txHash: qt.blockchainTxHash || 'pending'
    });
    await batch.save();

    // Trigger Fraud Detection Analysis
    try {
      const fraudService = require('../services/fraudDetection.service');
      const Beekeeper = require('../models/Beekeeper.model');
      const FraudAlert = require('../models/FraudAlert.model');
      
      const beekeeper = await Beekeeper.findById(batch.beekeeper);
      const alerts = await fraudService.analyzeBatch(batch, qt, beekeeper);
      
      if (alerts.riskScore > 0) {
        const severity = FraudAlert.getSeverity(alerts.riskScore);
        await FraudAlert.create({
          batch: batch._id,
          qualityTest: qt._id,
          beekeeper: beekeeper._id,
          riskScore: alerts.riskScore,
          severity,
          flags: alerts.flags
        });
        console.log(`🚨 Fraud alert created for batch ${batch.batchCode} with score ${alerts.riskScore}`);
      }
    } catch (fraudErr) {
      console.error('Error running fraud detection:', fraudErr);
      // Don't fail the test submission if fraud detection fails
    }

    res.status(201).json({ success: true, data: qt });
  } catch (err) { next(err); }
});

router.get('/batch/:batchId', protect, async (req, res, next) => {
  try {
    const qt = await QualityTest.findOne({ batch: req.params.batchId });
    res.json({ success: true, data: qt });
  } catch (err) { next(err); }
});

router.get('/pending', protect, authorize('LAB_TESTER'), async (req, res, next) => {
  try {
    const batches = await HoneyBatch.find({ status: { $in: ['SUBMITTED_FOR_TEST', 'TESTING'] } });
    res.json({ success: true, data: batches });
  } catch (err) { next(err); }
});

router.get('/all', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const tests = await QualityTest.find().populate({
      path: 'batch', select: 'batchCode floralSource'
    }).populate({
      path: 'testedBy', select: 'name email'
    }).sort({ createdAt: -1 });
    res.json({ success: true, data: tests });
  } catch (err) { next(err); }
});

module.exports = router;
