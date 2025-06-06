const express = require('express');
const router = express.Router();

// Middleware to get the db object from app.locals
router.use((req, res, next) => {
    req.dbRun = req.app.locals.dbRun;
    req.dbAll = req.app.locals.dbAll;
    req.dbGet = req.app.locals.dbGet;
    next();
});

// --- GET all reviews for a specific product ---
// Example: GET /api/reviews/product/1
router.get('/product/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        const reviews = await req.dbAll('SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC', [productId]);

        // You might want to calculate the average rating for the product here
        // and include it in the response, or store it in the products table.
        let averageRating = 0;
        if (reviews.length > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = totalRating / reviews.length;
        }

        res.status(200).json({
            reviews,
            averageRating: parseFloat(averageRating.toFixed(1)), // Format to one decimal place
            totalReviews: reviews.length
        });
    } catch (err) {
        console.error('Error fetching reviews:', err.message);
        res.status(500).json({ error: 'Failed to fetch reviews.' });
    }
});

// --- POST a new review ---
// Example: POST /api/reviews
router.post('/', async (req, res) => {
    const { productId, userId, reviewerName, reviewerEmail, rating, title, comment, verifiedPurchase } = req.body;

    // Basic validation
    if (!productId || !reviewerName || !rating || !comment) {
        return res.status(400).json({ error: 'Product ID, reviewer name, rating, and comment are required.' });
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    try {
        const insertReviewSql = `
            INSERT INTO reviews (product_id, user_id, reviewer_name, reviewer_email, rating, title, comment, verified_purchase)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            productId,
            userId || null, // Allow null for userId if not provided (anonymous)
            reviewerName,
            reviewerEmail || null, // Allow null for email
            rating,
            title || null, // Allow null for title
            comment,
            verifiedPurchase ? 1 : 0 // Convert boolean to integer for SQLite
        ];

        const result = await req.dbRun(insertReviewSql, params);

        // Optional: Update product's average rating and total reviews in the products table
        // This is a good practice to avoid calculating on every product detail fetch
        const productReviews = await req.dbAll('SELECT rating FROM reviews WHERE product_id = ?', [productId]);
        const newTotalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        const newAverageRating = newTotalRating / productReviews.length;

        await req.dbRun('UPDATE products SET rating = ?, reviews = ? WHERE id = ?', [
            parseFloat(newAverageRating.toFixed(1)), // Store rounded average rating
            productReviews.length,
            productId
        ]);

        res.status(201).json({ message: 'Review added successfully', reviewId: result.id });
    } catch (err) {
        console.error('Error adding review:', err.message);
        res.status(500).json({ error: 'Failed to add review.' });
    }
});

async function updateProductRatingAndReviews(productId) {
    // 1. Calculate new average rating and total reviews from the 'reviews' table
    const [result] = await db.execute(
        `SELECT AVG(rating) as avgRating, COUNT(id) as totalReviews FROM reviews WHERE product_id = ?`,
        [productId]
    );

    const avgRating = result[0].avgRating || 0; // Handle case where no reviews exist yet
    const totalReviews = result[0].totalReviews || 0;

    // 2. Update the products table with the new average and count
    await db.execute(
        `UPDATE products SET rating = ?, reviews = ? WHERE id = ?`,
        [avgRating, totalReviews, productId]
    );
}

module.exports = router;