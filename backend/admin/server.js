const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
 
const app = express();
const PORT = 5000;
 
// Middleware
app.use(cors());
 
// IMPORTANT: Increase the body-parser limit for JSON payloads
// This allows larger image data (like base64 strings) to be sent.
// '50mb' is an example; choose a size appropriate for your expected image sizes.
app.use(express.json({ limit: "50mb" })); // <--- ADD THIS OPTION HERE
 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
 
// ... (rest of your server.js code) ...
 
// SQLite Database Connection
const dbPath = path.resolve(__dirname, "ecommerce_admin.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create categories table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT,
            display_order INTEGER
        )`,
      (err) => {
        if (err) {
          console.error("Error creating categories table:", err.message);
        } else {
          console.log("Categories table ensured.");
        }
      }
    );
  }
});
 
// Helper to run DB queries with Promises
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
 
// API Endpoints for Categories
 
// GET all categories
app.get("/api/admin/categories", async (req, res) => {
  try {
    const categories = await dbAll(
      "SELECT * FROM categories ORDER BY display_order ASC"
    );
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
 
// POST a new category
app.post("/api/admin/categories", async (req, res) => {
  const { name, image } = req.body;
  if (!name || !image) {
    return res
      .status(400)
      .json({ error: "Category name and image are required." });
  }
  try {
    // Get the next display_order
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
 
// PUT (Update) a category
app.put("/api/admin/categories/:id", async (req, res) => {
  const { id } = req.params;
  const { name, image, order } = req.body; // 'order' is received from frontend, should map to 'display_order' in DB
 
  // Ensure 'order' is treated as display_order for the DB update
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
 
// DELETE a category
app.delete("/api/admin/categories/:id", async (req, res) => {
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
 
// Reorder categories (for drag and drop)
app.put("/api/admin/categories/reorder", async (req, res) => {
  const { categories: orderedCategories } = req.body; // Expects an array of { id: number, order: number }
 
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
 
// Start the server
app.listen(PORT, () => {
  console.log(`Admin backend server running on http://localhost:${PORT}`);
});
 
// Close the database connection when the Node.js process exits
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});
 