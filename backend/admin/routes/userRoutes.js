// C:\xampp\htdocs\aurora-commerce-hub\backend\admin\routes\userRoutes.js

const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken"); // Adjust path if necessary
const bcrypt = require("bcryptjs"); // For password change

// --- Get User Profile ---
router.get("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id; // User ID from authenticated token

  try {
    const user = await req.app.locals.dbGet(
      "SELECT id, name, email, phone FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err.message);
    res.status(500).json({ message: "Server error fetching profile." });
  }
});

// --- Update User Profile ---
router.put("/profile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: "Name, email, and phone are required." });
  }

  try {
    // Check if the new email already exists for another user
    const existingUserWithEmail = await req.app.locals.dbGet(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, userId]
    );

    if (existingUserWithEmail) {
      return res.status(409).json({ message: "Email already taken by another account." });
    }

    await req.app.locals.dbRun(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?",
      [name, email, phone, userId]
    );

    res.status(200).json({ message: "Profile updated successfully." });
  } catch (err) {
    console.error("Error updating user profile:", err.message);
    res.status(500).json({ message: "Server error updating profile." });
  }
});

// --- Change Password ---
router.post("/change-password", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current and new passwords are required." });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters long." });
  }

  try {
    const user = await req.app.locals.dbGet("SELECT password FROM users WHERE id = ?", [userId]);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid current password." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await req.app.locals.dbRun("UPDATE users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      userId,
    ]);

    res.status(200).json({ message: "Password changed successfully." });
  } catch (err) {
    console.error("Error changing password:", err.message);
    res.status(500).json({ message: "Server error changing password." });
  }
});

// --- Get User Addresses ---
router.get("/addresses", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const addresses = await req.app.locals.dbAll(
      "SELECT id, full_name, address1, address2, city, state, zip, country, is_default FROM shipping_details WHERE user_id = ?",
      [userId]
    );
    res.status(200).json(addresses);
  } catch (err) {
    console.error("Error fetching addresses:", err.message);
    res.status(500).json({ message: "Server error fetching addresses." });
  }
});

// --- Add New Address ---
router.post("/addresses", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { fullName, address1, address2, city, state, zip, country } = req.body;

  if (!fullName || !address1 || !city || !state || !zip || !country) {
    return res.status(400).json({ message: "Missing required address fields." });
  }

  try {
    // Check if this is the first address for the user, if so, make it default
    const existingAddresses = await req.app.locals.dbAll("SELECT id FROM shipping_details WHERE user_id = ?", [userId]);
    const isDefault = existingAddresses.length === 0 ? 1 : 0; // 1 for true, 0 for false

    const result = await req.app.locals.dbRun(
      `INSERT INTO shipping_details (user_id, full_name, address1, address2, city, state, zip, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, address1, address2, city, state, zip, country, isDefault]
    );
    res.status(201).json({ message: "Address added successfully.", id: result.id, isDefault: isDefault === 1 });
  } catch (err) {
    console.error("Error adding address:", err.message);
    res.status(500).json({ message: "Server error adding address." });
  }
});

// --- Update Address ---
router.put("/addresses/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;
  const { fullName, address1, address2, city, state, zip, country } = req.body;

  if (!fullName || !address1 || !city || !state || !zip || !country) {
    return res.status(400).json({ message: "Missing required address fields for update." });
  }

  try {
    const result = await req.app.locals.dbRun(
      `UPDATE shipping_details SET
         full_name = ?, address1 = ?, address2 = ?, city = ?, state = ?, zip = ?, country = ?
       WHERE id = ? AND user_id = ?`,
      [fullName, address1, address2, city, state, zip, country, addressId, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Address not found or does not belong to user." });
    }
    res.status(200).json({ message: "Address updated successfully." });
  } catch (err) {
    console.error("Error updating address:", err.message);
    res.status(500).json({ message: "Server error updating address." });
  }
});

// --- Set Default Address ---
router.put("/addresses/:id/set-default", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  try {
    // Start a transaction (SQLite doesn't fully support BEGIN/COMMIT with db.run like other databases,
    // but we can simulate atomicity by running updates sequentially and handling errors)
    // 1. Set all user's addresses to not default
    await req.app.locals.dbRun(
      "UPDATE shipping_details SET is_default = 0 WHERE user_id = ?",
      [userId]
    );

    // 2. Set the specified address to default
    const result = await req.app.locals.dbRun(
      "UPDATE shipping_details SET is_default = 1 WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Address not found or does not belong to user." });
    }
    res.status(200).json({ message: "Default address set successfully." });
  } catch (err) {
    console.error("Error setting default address:", err.message);
    res.status(500).json({ message: "Server error setting default address." });
  }
});


// --- Delete Address ---
router.delete("/addresses/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const addressId = req.params.id;

  try {
    // Check if the address is the default one and if there are other addresses
    const addressToDelete = await req.app.locals.dbGet(
      "SELECT is_default FROM shipping_details WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (!addressToDelete) {
      return res.status(404).json({ message: "Address not found or does not belong to user." });
    }

    const result = await req.app.locals.dbRun(
      "DELETE FROM shipping_details WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Address not found or does not belong to user." });
    }

    // If the deleted address was the default, try to set a new default
    if (addressToDelete.is_default === 1) {
      const remainingAddresses = await req.app.locals.dbAll(
        "SELECT id FROM shipping_details WHERE user_id = ? ORDER BY id ASC LIMIT 1",
        [userId]
      );
      if (remainingAddresses.length > 0) {
        await req.app.locals.dbRun(
          "UPDATE shipping_details SET is_default = 1 WHERE id = ?",
          [remainingAddresses[0].id]
        );
      }
    }

    res.status(200).json({ message: "Address deleted successfully." });
  } catch (err) {
    console.error("Error deleting address:", err.message);
    res.status(500).json({ message: "Server error deleting address." });
  }
});


module.exports = router;