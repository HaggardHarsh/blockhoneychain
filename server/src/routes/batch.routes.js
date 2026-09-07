const express = require('express');
const router = express.Router();
const HoneyBatch = require('../models/HoneyBatch.model');
const Beekeeper = require('../models/Beekeeper.model');
const blockchainService = require('../services/blockchain.service');
const qrService = require('../services/qr.service');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOne({ user: req.user._id });
    if(!bk) return res.status(404).json({ success: false, message: 'Beekeeper not found' });
    // Admin approval check removed as requested
    // if(bk.status !== 'APPROVED') return res.status(403).json({ success: false, message: 'Your profile is pending admin approval. You cannot create batches yet.' });
    const batchCode = `BAT-${Date.now()}`;
    const { hiveIds, ...rest } = req.body;

    // Create batch on blockchain using the beekeeper's on-chain numeric ID
    const tx = await blockchainService.createBatchOnChain(
      batchCode, bk.blockchainId || 0, rest.floralSource, rest.rawQuantityKg, new Date()
    );

    const batch = new HoneyBatch({
      ...rest,
      hives: hiveIds || [],
      beekeeper: bk._id,
      batchCode,
      status: 'HARVESTED',
      blockchainTxHash: tx.txHash,
      blockchainBatchId: tx.blockchainBatchId,
      statusHistory: [{
        status: 'HARVESTED',
        timestamp: new Date(),
        updatedBy: req.user._id,
        txHash: tx.txHash
      }]
    });

    batch.qrCodeUrl = await qrService.generateQRCode(batchCode);
    await batch.save();

    // Trigger initial Fraud Detection (for geo-mismatches)
    try {
      const fraudService = require('../services/fraudDetection.service');
      const FraudAlert = require('../models/FraudAlert.model');
      
      const alerts = await fraudService.analyzeBatch(batch, null, bk);
      
      if (alerts.riskScore > 0) {
        const severity = FraudAlert.getSeverity(alerts.riskScore);
        await FraudAlert.create({
          batch: batch._id,
          beekeeper: bk._id,
          riskScore: alerts.riskScore,
          severity,
          flags: alerts.flags
        });
        console.log(`🚨 Early fraud alert created for batch ${batchCode} (geo mismatch)`);
      }
    } catch (fraudErr) {
      console.error('Error running early fraud detection:', fraudErr);
    }

    res.status(201).json({ success: true, data: batch });
  } catch (err) { next(err); }
});

router.get('/', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOne({ user: req.user._id });
    const batches = await HoneyBatch.find({ beekeeper: bk._id });
    res.json({ success: true, data: batches });
  } catch (err) { next(err); }
});

router.get('/all', protect, authorize('ADMIN', 'LAB_TESTER'), async (req, res, next) => {
  try {
    const batches = await HoneyBatch.find().populate('beekeeper');
    res.json({ success: true, data: batches });
  } catch (err) { next(err); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const batch = await HoneyBatch.findById(req.params.id).populate('beekeeper').populate('hives').populate('qualityTest');
    res.json({ success: true, data: batch });
  } catch (err) { next(err); }
});

router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const batch = await HoneyBatch.findById(req.params.id);

    // Update status on blockchain using the on-chain batch ID
    const tx = await blockchainService.updateBatchStatusOnChain(batch.blockchainBatchId, status, notes);

    batch.status = status;
    batch.statusHistory.push({
      status,
      timestamp: new Date(),
      notes,
      updatedBy: req.user._id,
      txHash: tx.txHash
    });
    await batch.save();
    res.json({ success: true, data: batch });
  } catch (err) { next(err); }
});

router.get('/:id/qr', protect, async (req, res, next) => {
  try {
    const batch = await HoneyBatch.findById(req.params.id);
    res.json({ success: true, data: batch.qrCodeUrl });
  } catch (err) { next(err); }
});

const crypto = require('crypto');

router.get('/verify/:batchCode', async (req, res, next) => {
  try {
    const batch = await HoneyBatch.findOne({ batchCode: req.params.batchCode })
      .populate({ path: 'beekeeper', select: '-bankDetails' })
      .populate('hives')
      .populate('qualityTest');
    if(!batch) return res.status(404).json({ success: false, message: 'Batch not found' });

    // Fetch on-chain data for verification
    let blockchainData = null;
    let dataIntegrity = 'UNVERIFIED';

    if (batch.blockchainBatchId) {
      const onChainBatch = await blockchainService.getBatchFromChain(batch.blockchainBatchId);
      const onChainCert = await blockchainService.getCertificationFromChain(batch.blockchainBatchId);
      
      let hashMatches = true;
      if (onChainCert && batch.qualityTest) {
        // Recalculate hash from database to prove it hasn't been tampered with
        const qt = batch.qualityTest;
        const dataString = `${batch._id}-${qt.labName}-${qt.parameters.moisture.value}-${qt.parameters.hmf.value}-${qt.parameters.sucrose.value}-${qt.overallResult === 'PASS'}`;
        const calculatedHash = crypto.createHash('sha256').update(dataString).digest('hex');
        
        hashMatches = (calculatedHash === onChainCert.reportIpfsHash);
      }

      if (onChainBatch) {
        dataIntegrity = hashMatches ? 'VALID' : 'TAMPERED';
        blockchainData = {
          batch: onChainBatch,
          certification: onChainCert,
          verified: onChainBatch.batchCode === batch.batchCode,
          dataIntegrity
        };
      }
    }

    res.json({ success: true, data: batch, blockchain: blockchainData });
  } catch (err) { next(err); }
});

module.exports = router;
