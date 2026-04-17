// backend/routes/authRoutes.js

const express = require("express");
const bcrypt  = require("bcrypt");
const db      = require("../config/db");

const router = express.Router();

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  }

  try {
    // Check if email already taken
    const existing = await db.execute({
      sql:  "SELECT id FROM users WHERE email = ?",
      args: [email],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.execute({
      sql:  "INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, ?)",
      args: [name, email, hashedPassword, new Date().toISOString()],
    });

    res.status(201).json({ message: "Account created successfully." });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed. Please try again." });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const result = await db.execute({
      sql:  "SELECT * FROM users WHERE email = ?",
      args: [email],
    });

    if (result.rows.length === 0) {
      // Use a generic message — don't reveal whether the email exists
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user    = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Return safe user info — never send the password back
    res.json({
      message: "Login successful.",
      user: { id: user.id, name: user.name, email: user.email },
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

module.exports = router;