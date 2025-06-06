// C:\xampp\htdocs\aurora-commerce-hub\backend\routes\cartRoutes.js

const express = require('express');

module.exports = (app) => {
    const router = express.Router();
    const { dbGet, dbAll, dbRun } = app.locals;

    // --- Helper function to fetch cart items ---
    // This centralizes your cart fetching logic, ensuring consistency
    const fetchUserCart = async (userId) => {
        try {
            const cartItems = await dbAll(
                `SELECT
                    ci.id AS cart_item_id,
                    ci.product_id,
                    ci.quantity,
                    ci.selected_size,
                    ci.selected_color,
                    p.name AS product_name,
                    p.price AS product_price,
                    p.images AS product_images,
                    p.stock AS product_stock
                FROM
                    cart_items ci
                JOIN
                    products p ON ci.product_id = p.id
                WHERE
                    ci.user_id = ?`,
                [userId]
            );

            // Parse product_images if they are stored as JSON strings
            const parsedCartItems = cartItems.map(item => {
                if (item.product_images && typeof item.product_images === 'string') {
                    try {
                        item.product_images = JSON.parse(item.product_images);
                    } catch (e) {
                        console.error('Failed to parse product images for cart item:', e);
                        item.product_images = []; // Default to empty array on parse error
                    }
                } else if (!Array.isArray(item.product_images)) {
                    item.product_images = []; // Ensure it's an array if not a string
                }
                return item;
            });
            return parsedCartItems;
        } catch (error) {
            console.error('Error in fetchUserCart:', error.message);
            throw error; // Re-throw to be caught by the route handler
        }
    };

    // --- POST /api/cart/add route ---
    router.post('/add', async (req, res) => {
        const { userId, productId, quantity, selectedSize, selectedColor } = req.body;

        if (!userId || !productId || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Missing required fields: userId, productId, and quantity are mandatory.' });
        }

        try {
            // Start a transaction if your db library supports it for stronger consistency
            // if (db.beginTransaction) await db.beginTransaction(); // Conceptual

            const product = await dbGet(`SELECT stock FROM products WHERE id = ?`, [productId]);

            if (!product) {
                // if (db.rollback) await db.rollback();
                return res.status(404).json({ message: 'Product not found.' });
            }

            const productStock = product.stock;
            if (quantity > productStock) {
                // if (db.rollback) await db.rollback();
                return res.status(400).json({ message: `Insufficient stock. Only ${productStock} available.` });
            }

            let findCartItemQuery = `
                SELECT id, quantity FROM cart_items
                WHERE user_id = ? AND product_id = ?
            `;
            let findCartItemParams = [userId, productId];

            if (selectedSize !== undefined && selectedSize !== null && selectedSize !== '') {
                findCartItemQuery += ` AND selected_size = ?`;
                findCartItemParams.push(selectedSize);
            } else {
                findCartItemQuery += ` AND selected_size IS NULL`;
            }

            if (selectedColor !== undefined && selectedColor !== null && selectedColor !== '') {
                findCartItemQuery += ` AND selected_color = ?`;
                findCartItemParams.push(selectedColor);
            } else {
                findCartItemQuery += ` AND selected_color IS NULL`;
            }

            const existingCartItem = await dbGet(findCartItemQuery, findCartItemParams);

            if (existingCartItem) {
                const cartItemId = existingCartItem.id;
                const currentQuantity = existingCartItem.quantity;
                const newQuantity = currentQuantity + quantity;

                if (newQuantity > productStock) {
                    // if (db.rollback) await db.rollback();
                    return res.status(400).json({ message: `Cannot add more. Total quantity in cart (${newQuantity}) exceeds available stock (${productStock}).` });
                }

                await dbRun(
                    `UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                    [newQuantity, cartItemId]
                );
            } else {
                await dbRun(
                    `INSERT INTO cart_items (user_id, product_id, quantity, selected_size, selected_color, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                    [
                        userId,
                        productId,
                        quantity,
                        selectedSize || null,
                        selectedColor || null
                    ]
                );
            }

            // if (db.commit) await db.commit(); // Conceptual

            // --- IMPORTANT: Fetch the updated cart *after* the database operation ---
            const updatedCart = await fetchUserCart(userId);
            return res.status(200).json({ message: 'Item added to cart successfully.', cartItems: updatedCart });

        } catch (error) {
            // if (db.rollback) await db.rollback();
            console.error('Error adding item to cart:', error.message);
            res.status(500).json({ message: 'Server error: Could not add item to cart.', error: error.message });
        }
    });

    // --- GET /api/cart/:userId route ---
    router.get('/:userId', async (req, res) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        try {
            const cartItems = await fetchUserCart(userId); // Use the helper
            res.status(200).json({ cartItems });

        } catch (error) {
            console.error('Error fetching cart items:', error.message);
            res.status(500).json({ message: 'Server error: Could not fetch cart items.', error: error.message });
        }
    });

    // --- PUT /api/cart/update-quantity - Update quantity of a cart item ---
    router.put('/update-quantity', async (req, res) => {
        const { userId, cartItemId, newQuantity } = req.body;

        if (!userId || !cartItemId || newQuantity === undefined || newQuantity < 0) {
            return res.status(400).json({ message: 'Missing required fields: userId, cartItemId and newQuantity are mandatory, and newQuantity cannot be negative.' });
        }

        try {
            // if (db.beginTransaction) await db.beginTransaction();

            const cartItem = await dbGet(
                `SELECT ci.product_id, p.stock, ci.user_id FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ?`,
                [cartItemId]
            );

            if (!cartItem || cartItem.user_id !== userId) {
                // if (db.rollback) await db.rollback();
                return res.status(404).json({ message: 'Cart item not found or does not belong to the user.' });
            }

            const productStock = cartItem.stock;

            if (newQuantity === 0) {
                await dbRun(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`, [cartItemId, userId]);
            } else {
                if (newQuantity > productStock) {
                    // if (db.rollback) await db.rollback();
                    return res.status(400).json({ message: `Insufficient stock. Only ${productStock} available for this product.` });
                }
                await dbRun(
                    `UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`,
                    [newQuantity, cartItemId, userId]
                );
            }

            // if (db.commit) await db.commit();

            const updatedCart = await fetchUserCart(userId);
            return res.status(200).json({ message: 'Cart updated successfully.', cartItems: updatedCart });

        } catch (error) {
            // if (db.rollback) await db.rollback();
            console.error('Error updating cart item quantity:', error.message);
            res.status(500).json({ message: 'Server error: Could not update cart item quantity.', error: error.message });
        }
    });

    // --- DELETE /api/cart/remove - Remove a cart item ---
    router.delete('/remove', async (req, res) => {
        const { userId, cartItemId } = req.body;

        if (!userId || !cartItemId) {
            return res.status(400).json({ message: 'User ID and Cart item ID are required.' });
        }

        try {
            // if (db.beginTransaction) await db.beginTransaction();

            const result = await dbRun(`DELETE FROM cart_items WHERE id = ? AND user_id = ?`, [cartItemId, userId]);

            if (result.changes === 0) {
                // if (db.rollback) await db.rollback();
                return res.status(404).json({ message: 'Cart item not found or does not belong to the user.' });
            }

            // if (db.commit) await db.commit();

            const updatedCart = await fetchUserCart(userId);
            return res.status(200).json({ message: 'Cart item removed successfully.', cartItems: updatedCart });

        } catch (error) {
            // if (db.rollback) await db.rollback();
            console.error('Error removing cart item:', error.message);
            res.status(500).json({ message: 'Server error: Could not remove cart item.', error: error.message });
        }
    });

    // --- DELETE /api/cart/clear/:userId - Clear all cart items for a user ---
    router.delete('/clear/:userId', async (req, res) => {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        try {
            const result = await dbRun(`DELETE FROM cart_items WHERE user_id = ?`, [userId]);

            if (result.changes === 0) {
                return res.status(404).json({ message: 'No items found in cart to clear for this user.' });
            }

            // When clearing the cart, the cart is indeed empty
            return res.status(200).json({ message: 'Cart cleared successfully.', cartItems: [] });

        } catch (error) {
            console.error('Error clearing cart:', error.message);
            res.status(500).json({ message: 'Server error: Could not clear cart.', error: error.message });
        }
    });

    return router;
};