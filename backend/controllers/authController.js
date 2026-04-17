// backend/controllers/authController.js

const pool   = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "indigo_horizon_secret_key";

// ── REGISTER ──────────────────────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    // Check if email already exists
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
      [name.trim(), email.toLowerCase(), hashedPassword]
    );

    const user = result.rows[0];

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).json({
      message: "New User Created",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Register error:", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Find user
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User doesn't exist. Please sign up first." });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password. Please try again." });
    }

    // Sign JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
};

module.exports = { register, login };