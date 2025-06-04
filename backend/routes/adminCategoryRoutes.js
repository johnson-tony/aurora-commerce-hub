const express = require("express");
const router = express.Router(); // This is the Express Router for admin categories
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// IMPORTANT: Database connection for this router.
// In a larger application, you might pass the 'db' instance from server.js
// to avoid multiple connections. For simplicity and to make this router self-contained,
// we'll establish a connection here. Ensure the path to the DB is correct.
const dbPath = path.resolve(__dirname, "..", "ecommerce_admin.db"); // Go up one level from 'routes'
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database in adminCategoryRoutes:", err.message);
  } else {
    console.log("Connected to the SQLite database from adminCategoryRoutes.");
    // Ensure categories table exists (though server.js also does this)
    db.run(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        display_order INTEGER
      )`,
      (err) => {
        if (err) {
          console.error("Error creating categories table in adminCategoryRoutes:", err.message);
        }
      }
    );
  }
});

// Helper functions for database queries (copied from your original server.js)
const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// --- Admin API Endpoints for Categories ---
// Note: The paths here are relative to where this router will be "mounted" in server.js
// If mounted at "/api/admin/categories", then "/" here means "/api/admin/categories"

// GET all categories (Admin)
router.get("/", async (req, res) => {
  try {
    const categories = await dbAll(
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
    const result = await dbAll(
      "SELECT MAX(display_order) AS max_order FROM categories"
    );
    const nextOrder = (result[0].max_order || 0) + 1;

    const { id } = await dbRun(
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
    const { changes } = await dbRun(
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
    const { changes } = await dbRun("DELETE FROM categories WHERE id = ?", [
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
router.put("/reorder", async (req, res) => { // Changed to PUT for reorder based on common API practices
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
    await dbRun("BEGIN TRANSACTION");
    for (const cat of orderedCategories) {
      await dbRun("UPDATE categories SET display_order = ? WHERE id = ?", [
        cat.order,
        cat.id,
      ]);
    }
    await dbRun("COMMIT");
    res.json({ message: "Categories reordered successfully." });
  } catch (err) {
    await dbRun("ROLLBACK");
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; // Export this router
