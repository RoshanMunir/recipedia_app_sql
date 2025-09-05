// routes/auth.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

const normEmail = (s="") => s.trim().toLowerCase();

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password)
      return res.status(400).json({ message: "username, email, and password are required" });

    const e = normEmail(email);
    const existing = await User.findByEmail(e);
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const password_hash = await bcrypt.hash(password, 12);
    const { insertId } = await User.create({ username, email: e, password_hash, role: "user", is_paid: 0 });

    const token = jwt.sign({ userId: insertId, role: "user", is_paid: 0 }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: { id: insertId, username, email: e, role: "user", is_paid: 0 }
    });
  } catch {
    res.status(500).json({ message: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: "email and password are required" });

    const user = await User.findByEmail(normEmail(email)); // must return password_hash
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user.id, role: user.role, is_paid: user.is_paid },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, is_paid: user.is_paid }
    });
  } catch {
    res.status(500).json({ message: "Login failed" });
  }
});

module.exports = router;
