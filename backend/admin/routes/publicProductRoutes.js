const express = require('express');
const router = express.Router();

let dbAll;

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
        // --- FIX IS HERE ---
        // You need to explicitly include 'rating' and 'reviews' in your SELECT statement
        const products = await dbAll('SELECT id, name, description, price, discount, stock, category, images, rating, reviews FROM products WHERE available = 1');
        // --- END FIX ---

        const productsWithParsedImages = products.map(product => {
            try {
                product.images = product.images ? JSON.parse(product.images) : [];
            } catch (e) {
                console.error(`Error parsing images for product ID ${product.id}:`, e);
                product.images = [];
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
        // This one already correctly includes 'rating' and 'reviews'
        const product = await dbAll('SELECT id, name, description, price, discount, stock, category, images, rating, reviews FROM products WHERE id = ? AND available = 1', [id]);

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found or not available.' });
        }

        let singleProduct = product[0];
        try {
            singleProduct.images = singleProduct.images ? JSON.parse(singleProduct.images) : [];
        } catch (e) {
            console.error(`Error parsing images for product ID ${singleProduct.id}:`, e);
            singleProduct.images = [];
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
        // --- FIX IS HERE ---
        // You also need to explicitly include 'rating' and 'reviews' in this SELECT statement
        const products = await dbAll(
            'SELECT id, name, description, price, discount, stock, category, images, rating, reviews FROM products WHERE category = ? COLLATE NOCASE AND available = 1',
            [categoryName]
        );
        // --- END FIX ---

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