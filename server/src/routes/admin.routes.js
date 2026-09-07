const express = require('express');
const router = express.Router();
const Beekeeper = require('../models/Beekeeper.model');
const HoneyBatch = require('../models/HoneyBatch.model');
const QualityTest = require('../models/QualityTest.model');
const User = require('../models/User.model');
const { protect, authorize } = require('../middleware/auth.middleware');

router.get('/dashboard', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const [
      totalBeekeepers, pendingApprovals, approvedBeekeepers,
      totalBatches, batches,
      recentBatches, recentRegistrations,
      totalTests, passedTests
    ] = await Promise.all([
      Beekeeper.countDocuments(),
      Beekeeper.countDocuments({ status: 'PENDING' }),
      Beekeeper.countDocuments({ status: 'APPROVED' }),
      HoneyBatch.countDocuments(),
      HoneyBatch.find(),
      HoneyBatch.find().sort({ createdAt: -1 }).limit(5).populate('beekeeper'),
      Beekeeper.find().sort({ createdAt: -1 }).limit(5).populate('user'),
      QualityTest.countDocuments(),
      QualityTest.countDocuments({ overallResult: 'PASS' })
    ]);

    const batchesByStatus = batches.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {});
    
    const totalHoneyKg = batches.reduce((sum, b) => sum + (b.rawQuantityKg || 0), 0);
    const failedTests = totalTests - passedTests;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalBeekeepers, pendingApprovals, approvedBeekeepers,
        totalBatches, batchesByStatus, totalHoneyKg,
        qualityStats: { totalTests, passed: passedTests, failed: failedTests, passRate },
        recentBatches, recentRegistrations
      }
    });
  } catch (err) { next(err); }
});

router.get('/analytics/batches', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const batches = await HoneyBatch.find().populate('beekeeper');
    
    const byFloralSource = batches.reduce((acc, b) => {
      const source = b.floralSource || 'Unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const byRegion = batches.reduce((acc, b) => {
      const region = b.beekeeper?.address?.state || 'Unknown';
      acc[region] = (acc[region] || 0) + 1;
      return acc;
    }, {});

    res.json({ success: true, data: { byFloralSource, byRegion } });
  } catch (err) { next(err); }
});

router.get('/analytics/quality', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const tests = await QualityTest.find();
    
    const averageParameters = tests.reduce((acc, t) => {
      if (t.parameters?.moisture?.value) {
        acc.moistureSum += t.parameters.moisture.value;
        acc.moistureCount++;
      }
      if (t.parameters?.hmf?.value) {
        acc.hmfSum += t.parameters.hmf.value;
        acc.hmfCount++;
      }
      return acc;
    }, { moistureSum: 0, moistureCount: 0, hmfSum: 0, hmfCount: 0 });

    const avgMoisture = averageParameters.moistureCount > 0 ? averageParameters.moistureSum / averageParameters.moistureCount : 0;
    const avgHmf = averageParameters.hmfCount > 0 ? averageParameters.hmfSum / averageParameters.hmfCount : 0;

    res.json({ success: true, data: { avgMoisture, avgHmf, totalTested: tests.length } });
  } catch (err) { next(err); }
});

router.get('/users', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
});

router.put('/users/:id/role', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['BEEKEEPER', 'ADMIN', 'LAB_TESTER', 'DISTRIBUTOR'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
});

module.exports = router;
