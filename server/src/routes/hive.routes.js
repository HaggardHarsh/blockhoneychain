const express = require('express');
const router = express.Router();
const Hive = require('../models/Hive.model');
const Beekeeper = require('../models/Beekeeper.model');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOne({ user: req.user._id });
    if(!bk) return res.status(404).json({ success: false, message: 'Beekeeper not found' });
    if(bk.status !== 'APPROVED') return res.status(403).json({ success: false, message: 'Your profile is pending admin approval. You cannot create hives yet.' });
    const count = await Hive.countDocuments();
    const hiveCode = `HV-XX-${count + 1}`;
    const hive = await Hive.create({ ...req.body, beekeeper: bk._id, hiveCode });
    res.status(201).json({ success: true, data: hive });
  } catch (err) { next(err); }
});

router.get('/', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const bk = await Beekeeper.findOne({ user: req.user._id });
    const hives = await Hive.find({ beekeeper: bk._id, status: { $ne: 'INACTIVE' } });
    res.json({ success: true, data: hives });
  } catch (err) { next(err); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const hive = await Hive.findById(req.params.id);
    res.json({ success: true, data: hive });
  } catch (err) { next(err); }
});

router.put('/:id', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    const hive = await Hive.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: hive });
  } catch (err) { next(err); }
});

router.delete('/:id', protect, authorize('BEEKEEPER'), async (req, res, next) => {
  try {
    await Hive.findByIdAndUpdate(req.params.id, { status: 'INACTIVE' });
    res.json({ success: true, message: 'Hive deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
