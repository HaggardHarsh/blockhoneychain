const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Beekeeper = require('../models/Beekeeper.model');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/auth.middleware');

const emailService = require('../services/email.service');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });

router.post('/register', async (req, res, next) => {
  try {
    const { email, phone, password, fullName, role } = req.body;
    if (role === 'ADMIN') return res.status(400).json({ success: false, message: 'Cannot register as ADMIN' });
    
    const user = await User.create({ 
      email, phone, password, fullName, 
      role: role || 'BEEKEEPER',
      isEmailVerified: true // OTP bypassed for now
    });

    res.status(201).json({ success: true, message: 'Registration successful', email: user.email, token: signToken(user._id) });
  } catch (err) { next(err); }
});

router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    if (user.otp !== otp || user.otpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    res.json({ success: true, token: signToken(user._id), data: user });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isActive === false) return res.status(401).json({ success: false, message: 'Account disabled' });
    
    // Bypassed for demo purposes:
    // if (user.role === 'BEEKEEPER' && !user.isEmailVerified) {
    //   return res.status(403).json({ success: false, message: 'Please verify your email via the registration flow first.' });
    // }

    res.json({ success: true, token: signToken(user._id), data: user });
  } catch (err) { next(err); }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const userData = req.user.toObject();
    if (req.user.role === 'BEEKEEPER') {
      const beekeeper = await Beekeeper.findOne({ user: req.user._id });
      userData.profile = beekeeper;
    }
    res.json({ success: true, data: userData });
  } catch (err) { next(err); }
});

module.exports = router;
