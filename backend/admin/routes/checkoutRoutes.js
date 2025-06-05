// C:\xampp\htdocs\aurora-commerce-hub\backend\admin\routes\checkoutRoutes.js

const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken'); // Assuming you have this middleware

// Endpoint to save/update shipping details
router.post('/shipping', authenticateToken, async (req, res) => {
  const { id: user_id } = req.user; // Get user_id from the authenticated token
  const {
    email,
    phone,
    fullName,
    address1,
    address2,
    city,
    state,
    zip,
    country,
    shippingMethod
  } = req.body;

  // Basic validation (expand as needed)
  if (!email || !phone || !fullName || !address1 || !city || !state || !zip || !country || !shippingMethod) {
    return res.status(400).json({ message: "All required shipping details must be provided." });
  }

  try {
    // Check if shipping details already exist for this user
    const existingDetails = await req.app.locals.dbAll(
      "SELECT * FROM shipping_details WHERE user_id = ?",
      [user_id]
    );

    if (existingDetails.length > 0) {
      // Update existing details
      await req.app.locals.dbRun(
        `UPDATE shipping_details SET
           email = ?, phone = ?, full_name = ?, address1 = ?, address2 = ?,
           city = ?, state = ?, zip = ?, country = ?, shipping_method = ?
         WHERE user_id = ?`,
        [email, phone, fullName, address1, address2, city, state, zip, country, shippingMethod, user_id]
      );
      res.status(200).json({ message: "Shipping details updated successfully." });
    } else {
      // Insert new details
      await req.app.locals.dbRun(
        `INSERT INTO shipping_details
         (user_id, email, phone, full_name, address1, address2, city, state, zip, country, shipping_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, email, phone, fullName, address1, address2, city, state, zip, country, shippingMethod]
      );
      res.status(201).json({ message: "Shipping details saved successfully." });
    }
  } catch (err) {
    console.error("Error saving/updating shipping details:", err.message);
    res.status(500).json({ message: "Server error saving shipping details." });
  }
});


// Endpoint to fetch shipping details (optional, but useful for pre-filling)
router.get('/shipping', authenticateToken, async (req, res) => {
  const { id: user_id } = req.user;

  try {
    const details = await req.app.locals.dbAll(
      "SELECT email, phone, full_name, address1, address2, city, state, zip, country, shipping_method FROM shipping_details WHERE user_id = ?",
      [user_id]
    );

    if (details.length > 0) {
      // Return the first found details for the user
      res.status(200).json(details[0]);
    } else {
      res.status(404).json({ message: "No shipping details found for this user." });
    }
  } catch (err) {
    console.error("Error fetching shipping details:", err.message);
    res.status(500).json({ message: "Server error fetching shipping details." });
  }
});


module.exports = router;