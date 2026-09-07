const express = require('express');
const router = express.Router();
const FraudAlert = require('../models/FraudAlert.model');
const Beekeeper = require('../models/Beekeeper.model');
const HoneyBatch = require('../models/HoneyBatch.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// GET /api/fraud/alerts
// List all fraud alerts, optional filters
router.get('/alerts', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { status, severity } = req.query;
    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const alerts = await FraudAlert.find(query)
      .populate('batch', 'batchCode floralSource harvestDate status')
      .populate('beekeeper', 'fullName kvicRegistrationId status')
      .populate('qualityTest', 'labName reportNumber testDate overallResult')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
});

// GET /api/fraud/alerts/stats
// Summary counts of open alerts by severity
router.get('/alerts/stats', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const stats = await FraudAlert.aggregate([
      { $match: { status: { $in: ['OPEN', 'REVIEWING', 'CONFIRMED', 'DISPUTED'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const formattedStats = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      TOTAL: 0,
      DISPUTED: 0
    };

    // Also get severity counts for open/reviewing
    const severityStats = await FraudAlert.aggregate([
      { $match: { status: { $in: ['OPEN', 'REVIEWING'] } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    severityStats.forEach(s => {
      formattedStats[s._id] = s.count;
      formattedStats.TOTAL += s.count;
    });

    // Add disputed count
    const disputed = stats.find(s => s._id === 'DISPUTED');
    formattedStats.DISPUTED = disputed ? disputed.count : 0;

    res.json({ success: true, data: formattedStats });
  } catch (err) {
    next(err);
  }
});

// GET /api/fraud/alerts/batch/:batchId
// Get alerts for a specific batch
router.get('/alerts/batch/:batchId', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const alerts = await FraudAlert.find({ batch: req.params.batchId })
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
});

// PUT /api/fraud/alerts/:id
// Admin: Update alert status (dismiss/confirm)
router.put('/alerts/:id', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    
    if (!['OPEN', 'REVIEWING', 'DISMISSED', 'CONFIRMED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    alert.status = status;
    if (adminNotes !== undefined) alert.adminNotes = adminNotes;
    
    if (['DISMISSED', 'CONFIRMED'].includes(status)) {
      alert.reviewedBy = req.user._id;
      alert.reviewedAt = new Date();
    }

    // CONFIRMED: Flag the beekeeper (NOT suspend) and reject the batch
    // Beekeeper can then raise a dispute before final suspension
    if (status === 'CONFIRMED') {
      if (alert.beekeeper) {
        await Beekeeper.findByIdAndUpdate(alert.beekeeper, {
          status: 'FLAGGED',
          rejectionReason: `Flagged for suspected fraud (Alert #${alert._id.toString().slice(-6)}): ${adminNotes || 'Fraud confirmed by admin — awaiting your response'}`
        });
        console.log(`⚠️ Beekeeper ${alert.beekeeper} FLAGGED for fraud (can dispute)`);
      }

      if (alert.batch) {
        const batch = await HoneyBatch.findById(alert.batch);
        if (batch && !['REJECTED', 'DELIVERED'].includes(batch.status)) {
          batch.status = 'REJECTED';
          batch.statusHistory.push({
            status: 'REJECTED',
            timestamp: new Date(),
            updatedBy: req.user._id,
            notes: `Rejected due to confirmed fraud: ${adminNotes || 'Fraud confirmed by admin'}`
          });
          await batch.save();
        }
      }
    }

    await alert.save();
    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
});

// ============================================
// BEEKEEPER DISPUTE ENDPOINTS
// ============================================

// GET /api/fraud/my-alerts
// Beekeeper: View fraud alerts against them
router.get('/my-alerts', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOne({ user: req.user._id });
    if (!bk) return res.status(404).json({ success: false, message: 'Beekeeper not found' });

    const alerts = await FraudAlert.find({ beekeeper: bk._id, status: { $in: ['CONFIRMED', 'DISPUTED', 'SUSPENSION_CONFIRMED', 'CLEARED'] } })
      .populate('batch', 'batchCode floralSource harvestDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
});

// POST /api/fraud/dispute/:alertId
// Beekeeper: Raise a dispute against a fraud alert
router.post('/dispute/:alertId', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const { reason, evidence } = req.body;
    
    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({ success: false, message: 'Please provide a detailed reason (at least 10 characters)' });
    }

    const bk = await Beekeeper.findOne({ user: req.user._id });
    if (!bk) return res.status(404).json({ success: false, message: 'Beekeeper not found' });

    const alert = await FraudAlert.findById(req.params.alertId);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    // Only the flagged beekeeper can dispute their own alert
    if (alert.beekeeper.toString() !== bk._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only dispute your own alerts' });
    }

    // Can only dispute CONFIRMED alerts
    if (alert.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'This alert cannot be disputed in its current state' });
    }

    alert.status = 'DISPUTED';
    alert.disputeReason = reason;
    alert.disputeEvidence = evidence || null;
    alert.disputeDate = new Date();

    await alert.save();
    console.log(`📝 Beekeeper ${bk.fullName} disputed fraud alert #${alert._id.toString().slice(-6)}`);
    res.json({ success: true, data: alert, message: 'Dispute submitted successfully. Admin will review your response.' });
  } catch (err) {
    next(err);
  }
});

// ============================================
// ADMIN FINAL DECISION ENDPOINTS
// ============================================

// PUT /api/fraud/alerts/:id/final-decision
// Admin: Make final decision after reviewing dispute
router.put('/alerts/:id/final-decision', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { decision, adminNotes } = req.body;
    
    if (!['SUSPEND', 'CLEAR'].includes(decision)) {
      return res.status(400).json({ success: false, message: 'Decision must be SUSPEND or CLEAR' });
    }

    const alert = await FraudAlert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    if (!['CONFIRMED', 'DISPUTED'].includes(alert.status)) {
      return res.status(400).json({ success: false, message: 'Final decision can only be made on CONFIRMED or DISPUTED alerts' });
    }

    if (decision === 'SUSPEND') {
      // Final suspension
      alert.status = 'SUSPENSION_CONFIRMED';
      alert.finalDecision = 'SUSPENDED';
      alert.finalDecisionDate = new Date();
      if (adminNotes) alert.adminNotes = (alert.adminNotes || '') + ' | Final: ' + adminNotes;

      await Beekeeper.findByIdAndUpdate(alert.beekeeper, {
        status: 'SUSPENDED',
        rejectionReason: `Suspended after fraud review (Alert #${alert._id.toString().slice(-6)}): ${adminNotes || 'Suspension confirmed after review'}`
      });
      console.log(`🚫 Beekeeper ${alert.beekeeper} SUSPENDED (final decision)`);

    } else if (decision === 'CLEAR') {
      // Clear the beekeeper
      alert.status = 'CLEARED';
      alert.finalDecision = 'CLEARED';
      alert.finalDecisionDate = new Date();
      if (adminNotes) alert.adminNotes = (alert.adminNotes || '') + ' | Cleared: ' + adminNotes;

      // Restore beekeeper to APPROVED
      await Beekeeper.findByIdAndUpdate(alert.beekeeper, {
        status: 'APPROVED',
        rejectionReason: null
      });
      console.log(`✅ Beekeeper ${alert.beekeeper} CLEARED (false alarm)`);
    }

    alert.reviewedBy = req.user._id;
    alert.reviewedAt = new Date();
    await alert.save();

    res.json({ success: true, data: alert });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
