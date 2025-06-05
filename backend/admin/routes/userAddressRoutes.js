const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken"); // Required for token verification
require('dotenv').config(); // If you use dotenv for JWT_SECRET (recommended)

// --- Authentication Middleware ---
// This middleware assumes your JWT secret is in an environment variable `JWT_SECRET`.
// If not, replace `process.env.JWT_SECRET` with your actual secret string (e.g., 'your_super_secret_jwt_key').
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expects 'Bearer TOKEN'

  if (!token) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_fallback', (err, user) => {
    if (err) {
      // Token is invalid, expired, or malformed
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    // Token is valid, attach user payload (e.g., { id: 1, email: "test@example.com" }) to request
    req.user = user;
    next(); // Proceed to the next middleware/route handler
  });
};

// --- GET all addresses for the authenticated user ---
// Endpoint: GET /api/user/addresses
router.get("/", authenticateToken, async (req, res) => {
  const { dbAll } = req.app.locals;
  const userId = req.user.id; // Get user ID from the authenticated token

  try {
    const addresses = await dbAll(
      "SELECT id, full_name, address1, address2, city, state, zip, country, is_default FROM user_addresses WHERE user_id = ?",
      [userId]
    );

    // Convert is_default from 0/1 to boolean true/false for frontend consistency
    const formattedAddresses = addresses.map(addr => ({
      id: addr.id,
      fullName: addr.full_name,
      address1: addr.address1,
      address2: addr.address2,
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.is_default === 1
    }));
    res.json(formattedAddresses);
  } catch (err) {
    console.error("Error fetching addresses:", err.message);
    res.status(500).json({ error: "Failed to fetch addresses." });
  }
});

// --- POST a new address for the authenticated user ---
// Endpoint: POST /api/user/addresses
router.post("/", authenticateToken, async (req, res) => {
  const { dbRun } = req.app.locals;
  const userId = req.user.id;
  const { fullName, address1, address2, city, state, zip, country, isDefault } = req.body;

  // Basic validation
  if (!fullName || !address1 || !city || !state || !zip || !country) {
    return res.status(400).json({ message: "Missing required address fields." });
  }

  try {
    // If the new address is marked as default, unset any existing default for this user first
    if (isDefault) {
      await dbRun("UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_default = 1", [userId]);
    }

    // Insert the new address
    const result = await dbRun(
      `INSERT INTO user_addresses (user_id, full_name, address1, address2, city, state, zip, country, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, address1, address2, city, state, zip, country, isDefault ? 1 : 0]
    );
    res.status(201).json({ id: result.id, message: "Address added successfully." });
  } catch (err) {
    console.error("Error adding address:", err.message);
    // Specific error handling for the unique constraint on is_default
    if (err.message.includes("UNIQUE constraint failed: user_addresses.user_id, user_addresses.is_default")) {
      return res.status(400).json({ error: "A default address already exists. Please unset it or do not mark this new address as default." });
    }
    res.status(500).json({ error: "Failed to add address." });
  }
});

// --- PUT update an existing address for the authenticated user ---
// Endpoint: PUT /api/user/addresses/:id
router.put("/:id", authenticateToken, async (req, res) => {
  const { dbRun, dbAll } = req.app.locals;
  const userId = req.user.id;
  const addressId = req.params.id; // The ID of the address to update
  const { fullName, address1, address2, city, state, zip, country, isDefault } = req.body;

  // Basic validation
  if (!fullName || !address1 || !city || !state || !zip || !country) {
    return res.status(400).json({ message: "Missing required address fields." });
  }

  try {
    // Verify the address belongs to the authenticated user
    const existingAddress = await dbAll("SELECT id, is_default FROM user_addresses WHERE id = ? AND user_id = ?", [addressId, userId]);
    if (existingAddress.length === 0) {
      return res.status(404).json({ message: "Address not found or does not belong to the user." });
    }

    // Handle default status logic:
    // If the address is being set as default AND it wasn't already default
    if (isDefault && existingAddress[0].is_default !== 1) {
      await dbRun("UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_default = 1", [userId]);
    }
    // If the address is being unset as default AND it was previously default
    // Note: You might want to add logic here to ensure there's always a default,
    // or handle cases where all addresses are non-default. For now, it allows unsetting.
    // else if (!isDefault && existingAddress[0].is_default === 1) {
    //   // Potentially set a new default here if this was the only one or if policy dictates
    // }

    // Update the address details
    const result = await dbRun(
      `UPDATE user_addresses SET full_name = ?, address1 = ?, address2 = ?, city = ?, state = ?, zip = ?, country = ?, is_default = ?
       WHERE id = ? AND user_id = ?`,
      [fullName, address1, address2, city, state, zip, country, isDefault ? 1 : 0, addressId, userId]
    );

    if (result.changes === 0) {
      // This means the address was found but no data was actually changed,
      // or it wasn't found (though already checked above).
      return res.status(200).json({ message: "Address found, but no changes were made." });
    }
    res.json({ message: "Address updated successfully." });
  } catch (err) {
    console.error("Error updating address:", err.message);
    if (err.message.includes("UNIQUE constraint failed: user_addresses.user_id, user_addresses.is_default")) {
      return res.status(400).json({ error: "Cannot set multiple addresses as default. Unset the current default first." });
    }
    res.status(500).json({ error: "Failed to update address." });
  }
});

// --- PUT set a specific address as default for the authenticated user ---
// Endpoint: PUT /api/user/addresses/:id/set-default
router.put("/:id/set-default", authenticateToken, async (req, res) => {
  const { dbRun, dbAll } = req.app.locals;
  const userId = req.user.id;
  const addressId = req.params.id;

  try {
    // Verify the address belongs to the authenticated user
    const existingAddress = await dbAll("SELECT id FROM user_addresses WHERE id = ? AND user_id = ?", [addressId, userId]);
    if (existingAddress.length === 0) {
      return res.status(404).json({ message: "Address not found or does not belong to the user." });
    }

    // Start a transaction for atomicity (ensures both updates succeed or fail together)
    // SQLite doesn't have explicit transaction commands via db.run() in this simple way
    // but relies on a BEGIN/COMMIT/ROLLBACK approach.
    // For simple updates, direct calls might suffice. For robustness with multiple steps,
    // consider using serialize() or wrapping in a dedicated transaction function if more complex.
    // For now, we'll proceed with sequential updates.

    // 1. Unset current default address for this user
    await dbRun("UPDATE user_addresses SET is_default = 0 WHERE user_id = ? AND is_default = 1", [userId]);

    // 2. Set the specified address as default
    const result = await dbRun("UPDATE user_addresses SET is_default = 1 WHERE id = ? AND user_id = ?", [addressId, userId]);

    if (result.changes === 0) {
      // This means the address was not found or was already default and no change happened.
      // Given the earlier check, it's likely already default or an issue with the query.
      return res.status(404).json({ message: "Address not found or could not be set as default (might already be default)." });
    }

    res.json({ message: "Address set as default successfully." });

  } catch (err) {
    console.error("Error setting default address:", err.message);
    res.status(500).json({ error: "Failed to set default address." });
  }
});

// --- DELETE an address for the authenticated user ---
// Endpoint: DELETE /api/user/addresses/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  const { dbRun, dbAll } = req.app.locals;
  const userId = req.user.id;
  const addressId = req.params.id;

  try {
    // Optional: Check if the address is the only one or the default.
    // You might want to add logic here to prevent deletion if it's the only address
    // or to automatically set a new default if the deleted one was default.
    const addresses = await dbAll("SELECT id, is_default FROM user_addresses WHERE user_id = ?", [userId]);
    const addressToDelete = addresses.find(addr => addr.id == addressId); // Using == for type coercion with req.params.id (string)

    if (!addressToDelete) {
      return res.status(404).json({ message: "Address not found or does not belong to the user." });
    }

    // If deleting the default address and there are other addresses, a new default will implicitly be needed.
    // Your frontend should handle prompting the user to set a new default if this happens.
    // Or, you can add logic here to pick a new default if there are other addresses.
    if (addressToDelete.is_default === 1 && addresses.length > 1) {
        console.warn(`User ${userId} is deleting their default address (${addressId}). Frontend should prompt for a new default.`);
        // Optional: Implement logic to set a new default here if desired, e.g.:
        // const otherAddresses = addresses.filter(addr => addr.id != addressId);
        // if (otherAddresses.length > 0) {
        //   await dbRun("UPDATE user_addresses SET is_default = 1 WHERE id = ?", [otherAddresses[0].id]);
        // }
    } else if (addressToDelete.is_default === 1 && addresses.length === 1) {
        // If it's the only address and it's default, it's fine to delete. User will have no addresses.
    }


    // Delete the address
    const result = await dbRun(
      "DELETE FROM user_addresses WHERE id = ? AND user_id = ?",
      [addressId, userId]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Address not found or already deleted." });
    }
    res.json({ message: "Address deleted successfully." });
  } catch (err) {
    console.error("Error deleting address:", err.message);
    res.status(500).json({ error: "Failed to delete address." });
  }
});

module.exports = router;