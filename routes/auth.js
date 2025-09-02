const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// 📝 SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const isPaid = role === "professional_chef" ? 1 : 0;
    const result = await User.create({ username, email, password: hashedPassword, role, is_paid: isPaid });

    res.status(201).json({ message: "User registered successfully", userId: result.insertId, role, is_paid: isPaid });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔑 LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, is_paid: user.is_paid },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role, is_paid: user.is_paid },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
