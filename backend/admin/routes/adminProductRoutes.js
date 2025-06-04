const express = require("express");
const router = express.Router();

// Middleware to get db functions from app.locals
router.use((req, res, next) => {
  req.dbRun = req.app.locals.dbRun;
  req.dbAll = req.app.locals.dbAll;
  next();
});

// --- API Endpoints for Products ---

// GET all products
router.get("/", async (req, res) => {
  try {
    const products = await req.dbAll("SELECT * FROM products");
    // Parse images from JSON string back to array for frontend
    const parsedProducts = products.map((product) => ({
      ...product,
      images: product.images ? JSON.parse(product.images) : [],
      available: Boolean(product.available), // Convert INTEGER (0/1) to boolean
    }));
    res.json(parsedProducts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new product
router.post("/", async (req, res) => {
  const {
    name,
    description,
    price,
    discount,
    stock,
    category,
    available,
    images,
  } = req.body;

  if (!name || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Name, price, stock, and category are required." });
  }

  // Convert array of images to JSON string for storage
  const imagesJson = JSON.stringify(images || []);
  // Convert boolean 'available' to SQLite INTEGER (0 or 1)
  const availableInt = available ? 1 : 0;

  try {
    const { id } = await req.dbRun(
      "INSERT INTO products (name, description, price, discount, stock, category, available, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        description,
        price,
        discount || 0,
        stock,
        category,
        availableInt,
        imagesJson,
      ]
    );
    res.status(201).json({
      id,
      name,
      description,
      price,
      discount: discount || 0,
      stock,
      category,
      available: availableInt, // Send back as 1/0, frontend will convert
      images,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (Update) a product
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    price,
    discount,
    stock,
    category,
    available,
    images,
  } = req.body;

  if (!name || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Name, price, stock, and category are required." });
  }

  const imagesJson = JSON.stringify(images || []);
  const availableInt = available ? 1 : 0;

  try {
    const { changes } = await req.dbRun(
      "UPDATE products SET name = ?, description = ?, price = ?, discount = ?, stock = ?, category = ?, available = ?, images = ? WHERE id = ?",
      [
        name,
        description,
        price,
        discount || 0,
        stock,
        category,
        availableInt,
        imagesJson,
        id,
      ]
    );
    if (changes === 0) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ message: "Product updated successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a product
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { changes } = await req.dbRun("DELETE FROM products WHERE id = ?", [
      id,
    ]);
    if (changes === 0) {
      return res.status(404).json({ error: "Product not found." });
    }
    res.json({ message: "Product deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
