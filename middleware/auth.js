const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // ensure this path is correct

const router = express.Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email, password are required' });
    }
    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already exists' });

    const password_hash = await bcrypt.hash(password, 12);
    const result = await User.create({ username, email, password_hash });

    const token = jwt.sign({ userId: result.insertId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      message: 'User created',
      user: { id: result.insertId, username, email, role: 'user' },
      token
    });
  } catch {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'email and password are required' });

    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id, role: user.role || 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role || 'user' } });
  } catch {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
