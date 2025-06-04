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
      // Ensure 'images' is parsed. If it's null/undefined, default to an empty array.
      images: product.images ? JSON.parse(product.images) : [],
      available: Boolean(product.available), // Convert INTEGER (0/1) to boolean
    }));
    res.json(parsedProducts);
  } catch (err) {
    console.error("Error fetching products:", err.message); // Log error on backend
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
    images, // This will be the array of URLs from the frontend
  } = req.body;

  if (!name || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Name, price, stock, and category are required." });
  }

  // Convert array of image URLs to JSON string for storage in SQLite
  // Ensure images is always an array before stringifying
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
        discount || 0, // Default discount to 0 if not provided
        stock,
        category,
        availableInt,
        imagesJson,
      ]
    );
    // Respond with the newly created product details, including the image URLs (as an array)
    res.status(201).json({
      id,
      name,
      description,
      price,
      discount: discount || 0,
      stock,
      category,
      available: availableInt,
      images: images, // Send back the original array for immediate frontend use
    });
  } catch (err) {
    console.error("Error creating product:", err.message); // Log error on backend
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
    images, // This will be the array of URLs from the frontend
  } = req.body;

  if (!name || !price || !stock || !category) {
    return res
      .status(400)
      .json({ error: "Name, price, stock, and category are required." });
  }

  // Convert array of image URLs to JSON string for storage in SQLite
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
    console.error(`Error updating product ${id}:`, err.message); // Log error on backend
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
    console.error(`Error deleting product ${id}:`, err.message); // Log error on backend
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
