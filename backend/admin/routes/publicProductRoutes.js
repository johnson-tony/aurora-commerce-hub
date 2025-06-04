const express = require('express');
const router = express.Router();

// This will be initialized from app.locals.dbAll in server.js
let dbAll;

// Middleware to ensure dbAll is available (passed from server.js)
router.use((req, res, next) => {
    if (!req.app.locals.dbAll) {
        console.error('Database connection not available in publicProductRoutes.');
        return res.status(500).json({ error: 'Database service not initialized.' });
    }
    dbAll = req.app.locals.dbAll;
    next();
});

// GET all products (for public display)
// Endpoint: /api/products
router.get('/', async (req, res) => {
    try {
        // Only fetch products that are marked as available
        const products = await dbAll('SELECT id, name, description, price, discount, stock, category, images FROM products WHERE available = 1');

        // Parse the 'images' JSON string back into an array of URLs for each product
        const productsWithParsedImages = products.map(product => {
            try {
                // Ensure images is parsed, or default to an empty array if null/invalid
                product.images = product.images ? JSON.parse(product.images) : [];
            } catch (e) {
                console.error(`Error parsing images for product ID ${product.id}:`, e);
                product.images = []; // Default to empty array on parse error
            }
            return product;
        });

        res.status(200).json(productsWithParsedImages);
    } catch (err) {
        console.error('Error fetching products:', err.message);
        res.status(500).json({ error: 'Failed to fetch products.' });
    }
});

// GET a single product by ID (for public display)
// Endpoint: /api/products/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        // Only fetch if available
        const product = await dbAll('SELECT id, name, description, price, discount, stock, category, images FROM products WHERE id = ? AND available = 1', [id]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found or not available.' });
        }

        let singleProduct = product[0];
        try {
            // Parse the 'images' JSON string back into an array of URLs
            singleProduct.images = singleProduct.images ? JSON.parse(singleProduct.images) : [];
        } catch (e) {
            console.error(`Error parsing images for product ID ${singleProduct.id}:`, e);
            singleProduct.images = []; // Default to empty array on parse error
        }

        res.status(200).json(singleProduct);
    } catch (err) {
        console.error('Error fetching product by ID:', err.message);
        res.status(500).json({ error: 'Failed to fetch product.' });
    }
});

// --- NEW: GET products by category name (for public display) ---
// Endpoint: /api/products/category/:categoryName
router.get('/category/:categoryName', async (req, res) => {
    const { categoryName } = req.params;
    try {
        // Use LIKE for case-insensitive and flexible matching if needed,
        // but for exact match, using '=' is fine.
        // Assuming category names in DB are consistent (e.g., "Fashion", "Electronics").
        // We'll use COLLATE NOCASE for case-insensitive comparison in SQLite.
        const products = await dbAll(
            'SELECT id, name, description, price, discount, stock, category, images FROM products WHERE category = ? COLLATE NOCASE AND available = 1',
            [categoryName]
        );

        // Parse the 'images' JSON string back into an array of URLs for each product
        const productsWithParsedImages = products.map(product => {
            try {
                product.images = product.images ? JSON.parse(product.images) : [];
            } catch (e) {
                console.error(`Error parsing images for product ID ${product.id} in category filter:`, e);
                product.images = [];
            }
            return product;
        });

        res.status(200).json(productsWithParsedImages);
    } catch (err) {
        console.error(`Error fetching products for category '${categoryName}':`, err.message);
        res.status(500).json({ error: `Failed to fetch products for category '${categoryName}'.` });
    }
});

module.exports = router;
