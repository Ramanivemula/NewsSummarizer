const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/authMiddleware')

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, newsTypes, country, state, notifyDaily, deliveryMethod } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      newsTypes,
      country,
      state,
      notifyDaily,
      deliveryMethod
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    // Save OTP
    await Otp.findOneAndUpdate(
      { email },
      { code, expiresAt },
      { upsert: true, new: true }
    );

    // Send OTP via email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your OTP for NewsSummarizer Login',
      text: `Your OTP is: ${code}. It will expire in 5 minutes.`,
    });

    // Respond back to frontend
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// POST /auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const record = await Otp.findOne({ email });
  if (!record) return res.status(400).json({ message: 'No OTP found' });

  if (record.code !== otp.toString()) {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  if (record.expiresAt < new Date()) {
    return res.status(410).json({ message: 'OTP expired' });
  }

  const user = await User.findOne({ email });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  await Otp.deleteOne({ email });

  res.json({
    token,
    user: {
      name: user.name,
      email: user.email,
      newsTypes: user.newsTypes,
      country: user.country,
      state: user.state,
      notifyDaily: user.notifyDaily,
      deliveryMethod: user.deliveryMethod
    }
  });
});

// Add this in authRoutes.js temporarily
router.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: 'ramani.vemula@mitaoe.ac.in', // Replace with your test email
      subject: 'Test OTP Email',
      text: 'If you receive this, OTP emails will work.'
    });
    res.send('✅ Email sent!');
  } catch (err) {
    res.status(500).send('❌ Failed to send email: ' + err.message);
  }
});

const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
