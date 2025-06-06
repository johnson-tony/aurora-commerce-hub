const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken'); // Ensure this path is correct

module.exports = (db) => {
    // --- GET /api/orders ---
    // Fetches all orders for the authenticated user.
    router.get('/', authenticateToken, async (req, res) => {
        const userId = req.user.id; // User ID obtained from the authentication token

        try {
            // Fetch main order details from the 'orders' table
            const orders = await db.all(
                `SELECT id, order_date, total_amount, status, shipping_address, payment_method
                 FROM orders
                 WHERE user_id = ?
                 ORDER BY order_date DESC`,
                [userId]
            );

            // For each order, fetch its associated items from the 'order_items' table
            for (const order of orders) {
                order.items = await db.all(
                    `SELECT product_id, product_name, quantity, unit_price, image_url, selected_size, selected_color
                     FROM order_items
                     WHERE order_id = ?`,
                    [order.id]
                );
            }

            res.status(200).json(orders);
        } catch (err) {
            console.error("Error fetching user orders:", err.message);
            res.status(500).json({ error: "Failed to retrieve orders." });
        }
    });

    // --- GET /api/orders/:orderId ---
    // Fetches a specific order by ID for the authenticated user.
    router.get('/:orderId', authenticateToken, async (req, res) => {
        const userId = req.user.id;
        const { orderId } = req.params;

        try {
            // Fetch specific order details, ensuring it belongs to the authenticated user
            const order = await db.get(
                `SELECT id, order_date, total_amount, status, shipping_address, payment_method
                 FROM orders
                 WHERE id = ? AND user_id = ?`,
                [orderId, userId]
            );

            if (!order) {
                // If no order is found or it doesn't belong to the user
                return res.status(404).json({ error: "Order not found or unauthorized access." });
            }

            // Fetch items for that specific order from the 'order_items' table
            order.items = await db.all(
                `SELECT product_id, product_name, quantity, unit_price, image_url, selected_size, selected_color
                 FROM order_items
                 WHERE order_id = ?`,
                [order.id]
            );

            res.status(200).json(order);
        } catch (err) {
            console.error("Error fetching specific order:", err.message);
            res.status(500).json({ error: "Failed to retrieve order details." });
        }
    });

    // --- POST /api/orders ---
    // Creates a new order, typically after a successful checkout process.
    // This route moves items from the user's cart to the orders and order_items tables.
    router.post('/', authenticateToken, async (req, res) => {
        const userId = req.user.id;
        // The request body should contain the items from the user's cart,
        // along with shipping and payment information.
        const { cartItems, shippingAddress, paymentMethod } = req.body;

        if (!cartItems || cartItems.length === 0 || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ error: 'Missing required order details (cart items, shipping address, or payment method).' });
        }

        let totalAmount = 0;
        // Calculate the total amount. In a real system, you'd want to re-fetch
        // product prices from the 'products' table here to prevent client-side tampering.
        cartItems.forEach(item => {
            totalAmount += item.quantity * item.price;
        });

        // Use a try-catch block to handle database operations and potential errors.
        try {
            // Start a transactional block to ensure atomicity:
            // If any step fails, the entire order creation process should be rolled back.
            // SQLite with node-sqlite3 typically requires explicit transaction management
            // (BEGIN TRANSACTION, COMMIT, ROLLBACK). For this example, we'll execute sequentially
            // and log errors, but be aware of potential partial writes if an error occurs mid-way.

            // 1. Insert the main order record into the 'orders' table
            const orderInsertResult = await db.run(
                `INSERT INTO orders (user_id, total_amount, status, shipping_address, payment_method)
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, totalAmount, 'Pending', shippingAddress, paymentMethod] // Initial status is 'Pending'
            );
            const orderId = orderInsertResult.id; // Get the ID of the newly created order

            // 2. Insert each product from the cart into the 'order_items' table
            for (const item of cartItems) {
                await db.run(
                    `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, image_url, selected_size, selected_color)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [orderId, item.productId, item.name, item.quantity, item.price, item.imageUrl, item.selectedSize || null, item.selectedColor || null]
                );
            }

            // 3. Clear the user's cart after the order has been successfully created
            await db.run(
                `DELETE FROM cart_items WHERE user_id = ?`,
                [userId]
            );

            // Respond with success message and the new order ID
            res.status(201).json({ message: 'Order placed successfully!', orderId: orderId });

        } catch (err) {
            console.error("Error creating new order:", err.message);
            // In a production application, if a transaction is used, you would perform a ROLLBACK here.
            res.status(500).json({ error: "Failed to place order. Please try again." });
        }
    });

    return router;
};