// C:\xampp\htdocs\aurora-commerce-hub\backend\admin\routes\authRoutes.js

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const crypto = require("crypto"); // For generating random tokens

// Load environment variables
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_please_change';

// --- Corrected Register Route ---
router.post("/register", async (req, res) => {
  const { name, email, password, phone } = req.body; // Ensure 'phone' is destructured from req.body
  
  // You might want to make phone required here, or keep it optional.
  // If optional, `phone` can be null.
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all required fields (name, email, password)." });
  }

  try {
    const existingUser = await req.app.locals.dbAll("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: "User with this email already exists." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // CORRECTED: Pass 'phone' as the fourth parameter to dbRun
    const result = await req.app.locals.dbRun(
      "INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, phone] // <--- Corrected: Added 'phone' here!
    );

    res.status(201).json({ message: "User registered successfully!", userId: result.id });
  } catch (err) {
    console.error("Error during user registration:", err.message);
    res.status(500).json({ message: "Server error during registration." });
  }
});

// --- Existing Login Route (no changes needed for phone saving, but you might want to return it) ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all required fields." });
  }
  try {
    const users = await req.app.locals.dbAll("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email }, // Payload for JWT. You can add phone here if needed in the token.
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(200).json({
      message: "Login successful!",
      token: token,
      // OPTIONAL IMPROVEMENT: Include phone in the returned user object
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (err) {
    console.error("Error during user login:", err.message);
    res.status(500).json({ message: "Server error during login." });
  }
});

// --- Forgot Password Route (no changes) ---
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Please provide an email address." });
  }

  try {
    const users = await req.app.locals.dbAll("SELECT * FROM users WHERE email = ?", [email]);
    const user = users[0];

    if (!user) {
      return res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 3600000).toISOString();

    await req.app.locals.dbRun(
      "UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?",
      [resetToken, resetTokenExpiresAt, user.id]
    );

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    console.log(`--- PASSWORD RESET LINK FOR ${user.email} ---`);
    console.log(`Please click this link to reset your password: ${resetLink}`);
    console.log(`-----------------------------------------------`);
    res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent. (Check console for dev link)",
        devLink: resetLink
    });

  } catch (err) {
    console.error("Error during forgot password request:", err.message);
    res.status(500).json({ message: "Server error during password reset request." });
  }
});

// --- Reset Password Route (no changes) ---
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required." });
  }

  try {
    const users = await req.app.locals.dbAll(
      "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires_at > ?",
      [token, new Date().toISOString()]
    );
    const user = users[0];

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired password reset token." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await req.app.locals.dbRun(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?",
      [hashedPassword, user.id]
    );

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Error during password reset:", err.message);
    res.status(500).json({ message: "Server error during password reset." });
  }
});

module.exports = router;