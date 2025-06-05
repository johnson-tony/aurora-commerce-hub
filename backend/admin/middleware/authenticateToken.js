// C:\xampp\htdocs\aurora-commerce-hub\backend\admin\middleware\authenticateToken.js

const jwt = require('jsonwebtoken');
require('dotenv').config(); // Ensure dotenv is configured if you use .env for JWT_SECRET

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_please_change'; // USE A STRONG, UNIQUE SECRET

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      // Token is invalid or expired
      console.error("JWT verification error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; // Attach the decoded user payload to the request (contains user id, email etc.)
    next(); // Proceed to the next middleware/route handler
  });
};

module.exports = authenticateToken;