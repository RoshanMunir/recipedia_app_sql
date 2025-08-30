const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const router = express.Router();

// 📝 SIGNUP
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 1. Check if user already exists
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email],
      async (err, results) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Database error", error: err.message });
        }

        if (results.length > 0) {
          return res.status(400).json({ message: "Username or email already exists" });
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Insert new user
        db.query(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
          [username, email, hashedPassword],
          (err, result) => {
            if (err) {
              console.error("Insert error:", err);
              return res.status(500).json({ message: "Database error", error: err.message });
            }

            // 4. Generate JWT token
            const token = jwt.sign(
              { id: result.insertId, username, email },
              process.env.JWT_SECRET || "your_secret_key",
              { expiresIn: "1h" }
            );

            res.status(201).json({ message: "User created successfully", token });
          }
        );
      }
    );
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// 🔑 LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error", error: err.message });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const user = results[0];

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET || "your_secret_key",
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token });
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
