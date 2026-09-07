const express = require('express');
const router = express.Router();
const Beekeeper = require('../models/Beekeeper.model');
const User = require('../models/User.model');
const Hive = require('../models/Hive.model');
const blockchainService = require('../services/blockchain.service');
const emailService = require('../services/email.service');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/profile', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.create({ ...req.body, user: req.user._id, status: 'PENDING' });
    res.status(201).json({ success: true, data: bk });
  } catch (err) { next(err); }
});

router.get('/me', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOne({ user: req.user._id });
    res.json({ success: true, data: bk });
  } catch (err) { next(err); }
});

router.put('/me', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOneAndUpdate({ user: req.user._id }, req.body, { new: true });
    res.json({ success: true, data: bk });
  } catch (err) { next(err); }
});

router.get('/', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    const bks = await Beekeeper.find(query).populate('user').limit(limit * 1).skip((page - 1) * limit);
    res.json({ success: true, data: bks });
  } catch (err) { next(err); }
});

router.get('/:id', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findById(req.params.id).populate('user');
    const hives = await Hive.find({ beekeeper: bk._id });
    res.json({ success: true, data: { ...bk.toObject(), hives } });
  } catch (err) { next(err); }
});

router.put('/:id/approve', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findById(req.params.id).populate('user');
    bk.status = 'APPROVED';
    await User.findByIdAndUpdate(bk.user._id, { isApproved: true });

    // Register on blockchain and save the on-chain ID
    const tx = await blockchainService.registerBeekeeperOnChain(
      bk.kvicRegistrationId, bk.fullName, bk.address, 'ipfs'
    );
    if (tx.success) {
      bk.blockchainId = tx.blockchainId;
      bk.blockchainTxHash = tx.txHash;
    }

    await bk.save();

    // Send the approval email
    if (bk.user.email) {
      emailService.sendApprovalEmail(bk.user.email, bk.fullName);
    }

    res.json({ success: true, data: bk });
  } catch (err) { next(err); }
});

router.put('/:id/reject', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const bk = await Beekeeper.findByIdAndUpdate(req.params.id, { status: 'REJECTED' }, { new: true }).populate('user');
    
    // Send the rejection email
    if (bk && bk.user.email) {
      emailService.sendRejectionEmail(bk.user.email, bk.fullName, reason);
    }
    
    res.json({ success: true, data: bk });
  } catch (err) { next(err); }
});

router.put('/:id/suspend', protect, authorize('ADMIN'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findByIdAndUpdate(req.params.id, { status: 'SUSPENDED' }, { new: true });
    res.json({ success: true, data: bk });
  } catch (err) { next(err); }
});

module.exports = router;
