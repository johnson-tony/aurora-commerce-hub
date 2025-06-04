const express = require("express");
const router = express.Router(); // Create an Express Router

// IMPORTANT: Access database helper functions from app.locals
// This middleware runs for every request hitting this router.
// It attaches dbRun and dbAll to the request object for easy access.
router.use((req, res, next) => {
  req.dbRun = req.app.locals.dbRun; // Not strictly needed for this router, but good practice
  req.dbAll = req.app.locals.dbAll;
  next(); // Pass control to the next middleware/route handler
});

// --- Public API Endpoints for Categories ---
// These endpoints are for general users/frontend display.
// They will be mounted at "/api/categories" in server.js

// GET all public categories
// Accessible at http://localhost:5000/api/categories
router.get("/", async (req, res) => {
  try {
    // For public display, you might only select specific columns
    const categories = await req.dbAll( // Use req.dbAll
      "SELECT id, name, image, display_order FROM categories ORDER BY display_order ASC"
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single public category by ID
// Accessible at http://localhost:5000/api/categories/:id
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const category = await req.dbAll("SELECT id, name, image, display_order FROM categories WHERE id = ?", [id]); // Use req.dbAll
    if (category.length === 0) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json(category[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // Export this router
