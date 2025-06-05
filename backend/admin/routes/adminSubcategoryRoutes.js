const express = require("express");
const router = express.Router();

// Helper to execute DB queries (provided by server.js app.locals)
let dbRun;
let dbAll;

// Middleware to inject db functions into the router
router.use((req, res, next) => {
  dbRun = req.app.locals.dbRun;
  dbAll = req.app.locals.dbAll;
  next();
});

// --- GET All Subcategories for a Specific Category (READ) ---
// Route: /api/admin/categories/:categoryId/subcategories
router.get("/:categoryId/subcategories", async (req, res) => {
  const { categoryId } = req.params;
  try {
    const subcategories = await dbAll(
      "SELECT * FROM subcategories WHERE parent_id = ? ORDER BY display_order ASC",
      [categoryId]
    );
    res.json(subcategories);
  } catch (err) {
    console.error("Error fetching subcategories:", err.message);
    res.status(500).json({ error: "Failed to fetch subcategories" });
  }
});

// --- POST Create a New Subcategory (CREATE) ---
// Route: /api/admin/categories/:categoryId/subcategories
router.post("/:categoryId/subcategories", async (req, res) => {
  const { categoryId } = req.params;
  const { name, image } = req.body;

  if (!name || !image) {
    return res.status(400).json({ error: "Name and image are required." });
  }

  try {
    // Get the maximum display_order for the given parent_id and increment it
    const maxOrderRow = await dbAll(
      "SELECT MAX(display_order) as maxOrder FROM subcategories WHERE parent_id = ?",
      [categoryId]
    );
    const newOrder = (maxOrderRow[0].maxOrder || 0) + 1;

    const result = await dbRun(
      "INSERT INTO subcategories (name, image, display_order, parent_id) VALUES (?, ?, ?, ?)",
      [name, image, newOrder, categoryId]
    );
    res.status(201).json({
      id: result.id,
      name,
      image,
      display_order: newOrder,
      parent_id: parseInt(categoryId),
    });
  } catch (err) {
    console.error("Error creating subcategory:", err.message);
    res.status(500).json({ error: "Failed to create subcategory" });
  }
});

// --- PUT Update a Subcategory by ID (UPDATE) ---
// Route: /api/admin/subcategories/:id
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, image, display_order, parent_id } = req.body; // parent_id should be included to confirm context if needed

  if (!name || !image || display_order === undefined || !parent_id) {
    return res
      .status(400)
      .json({
        error: "Name, image, display_order, and parent_id are required.",
      });
  }

  try {
    const result = await dbRun(
      "UPDATE subcategories SET name = ?, image = ?, display_order = ?, parent_id = ? WHERE id = ?",
      [name, image, display_order, parent_id, id]
    );
    if (result.changes === 0) {
      return res.status(404).json({ error: "Subcategory not found." });
    }
    res.json({ message: "Subcategory updated successfully." });
  } catch (err) {
    console.error("Error updating subcategory:", err.message);
    res.status(500).json({ error: "Failed to update subcategory" });
  }
});

// --- DELETE a Subcategory by ID (DELETE) ---
// Route: /api/admin/subcategories/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await dbRun("DELETE FROM subcategories WHERE id = ?", [id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: "Subcategory not found." });
    }
    res.json({ message: "Subcategory deleted successfully." });
  } catch (err) {
    console.error("Error deleting subcategory:", err.message);
    res.status(500).json({ error: "Failed to delete subcategory" });
  }
});

// --- PUT Reorder Subcategories for a Specific Category ---
// Route: /api/admin/categories/:categoryId/subcategories/reorder
router.put("/:categoryId/subcategories/reorder", async (req, res) => {
  const { categoryId } = req.params;
  const { subcategories: orderedSubcategories } = req.body; // Expects an array of {id: ..., order: ...}

  if (
    !Array.isArray(orderedSubcategories) ||
    orderedSubcategories.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Invalid subcategories array provided for reordering." });
  }

  try {
    const promises = orderedSubcategories.map((subcat) =>
      dbRun(
        "UPDATE subcategories SET display_order = ? WHERE id = ? AND parent_id = ?",
        [subcat.order, subcat.id, categoryId]
      )
    );
    await Promise.all(promises);
    res.json({ message: "Subcategories reordered successfully." });
  } catch (err) {
    console.error("Error reordering subcategories:", err.message);
    res.status(500).json({ error: "Failed to reorder subcategories" });
  }
});

module.exports = router;
