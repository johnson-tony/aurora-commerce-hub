const express = require("express");
const router = express.Router(); // Create an Express Router

// IMPORTANT: Access database helper functions from app.locals
// This middleware runs for every request hitting this router.
// It attaches dbRun and dbAll to the request object for easy access.
router.use((req, res, next) => {
  req.dbRun = req.app.locals.dbRun;
  req.dbAll = req.app.locals.dbAll;
  next(); // Pass control to the next middleware/route handler
});

// --- Admin API Endpoints for Categories ---
// Note: The paths here are relative to where this router is "mounted" in server.js
// If mounted at "/api/admin/categories", then "/" here means "/api/admin/categories"

// GET all categories (Admin)
router.get("/", async (req, res) => {
  try {
    const categories = await req.dbAll( // Use req.dbAll to access the helper function
      "SELECT * FROM categories ORDER BY display_order ASC"
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new category (Admin)
router.post("/", async (req, res) => {
  const { name, image } = req.body;
  if (!name || !image) {
    return res
      .status(400)
      .json({ error: "Category name and image are required." });
  }
  try {
    const result = await req.dbAll( // Use req.dbAll
      "SELECT MAX(display_order) AS max_order FROM categories"
    );
    const nextOrder = (result[0].max_order || 0) + 1;

    const { id } = await req.dbRun( // Use req.dbRun
      "INSERT INTO categories (name, image, display_order) VALUES (?, ?, ?)",
      [name, image, nextOrder]
    );
    res.status(201).json({ id, name, image, display_order: nextOrder });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (Update) a category (Admin)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, image, order } = req.body;

  if (!name || !image || order === undefined) {
    return res
      .status(400)
      .json({ error: "Category name, image, and order are required." });
  }

  try {
    const { changes } = await req.dbRun( // Use req.dbRun
      "UPDATE categories SET name = ?, image = ?, display_order = ? WHERE id = ?",
      [name, image, order, id]
    );
    if (changes === 0) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json({ message: "Category updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a category (Admin)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { changes } = await req.dbRun("DELETE FROM categories WHERE id = ?", [ // Use req.dbRun
      id,
    ]);
    if (changes === 0) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.json({ message: "Category deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reorder categories (Admin)
router.put("/reorder", async (req, res) => {
  const { categories: orderedCategories } = req.body;

  if (!Array.isArray(orderedCategories) || orderedCategories.length === 0) {
    return res
      .status(400)
      .json({
        error:
          "Invalid request body. Expected an array of categories with id and order.",
      });
  }

  try {
    await req.dbRun("BEGIN TRANSACTION"); // Use req.dbRun
    for (const cat of orderedCategories) {
      await req.dbRun("UPDATE categories SET display_order = ? WHERE id = ?", [ // Use req.dbRun
        cat.order,
        cat.id,
      ]);
    }
    await req.dbRun("COMMIT"); // Use req.dbRun
    res.json({ message: "Categories reordered successfully." });
  } catch (err) {
    await req.dbRun("ROLLBACK"); // Use req.dbRun
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // Export the router
