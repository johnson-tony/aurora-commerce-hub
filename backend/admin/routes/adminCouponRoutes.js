const express = require("express");
const router = express.Router();

// Helper function to convert SQLite boolean (0/1) to JavaScript boolean (true/false)
const convertSqliteBoolean = (obj) => {
  if (obj && typeof obj === "object" && obj.hasOwnProperty("is_active")) {
    return {
      ...obj,
      is_active: Boolean(obj.is_active), // Converts 0 to false, 1 to true
    };
  }
  return obj;
};

// --- GET All Coupons (Admin List) ---
// This route will correctly respond to GET /api/admin/coupons
router.get("/", async (req, res) => {
  const dbAll = req.app.locals.dbAll;
  if (!dbAll) {
    return res
      .status(500)
      .json({ message: "Database `dbAll` helper not initialized." });
  }

  try {
    const coupons = await dbAll(
      "SELECT * FROM coupons ORDER BY created_at DESC"
    );
    const processedCoupons = coupons.map(convertSqliteBoolean);
    res.status(200).json(processedCoupons);
  } catch (err) {
    console.error("Error fetching coupons:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch coupons.", error: err.message });
  }
});

// --- GET Export Coupons (e.g., CSV) ---
// This route MUST be defined BEFORE any routes with parameters like /:id
// to ensure it's matched correctly for /api/admin/coupons/export.
router.get("/export", async (req, res) => {
  const dbAll = req.app.locals.dbAll;
  if (!dbAll) {
    return res
      .status(500)
      .json({ message: "Database `dbAll` helper not initialized." });
  }

  try {
    const coupons = await dbAll(
      "SELECT * FROM coupons ORDER BY created_at DESC"
    );

    // Define CSV header
    let csvContent =
      "id,code,description,discount_type,discount_value,minimum_spend,usage_limit_per_coupon,usage_limit_per_customer,start_date,end_date,is_active,created_at,updated_at\n";

    // Append coupon data
    coupons.forEach((coupon) => {
      const row = [
        coupon.id,
        `"${coupon.code}"`, // Wrap code in quotes to handle commas
        `"${coupon.description || ""}"`, // Ensure description is a string, handle null/undefined, and wrap
        coupon.discount_type,
        coupon.discount_value,
        coupon.minimum_spend || "", // Handle null/undefined for CSV
        coupon.usage_limit_per_coupon || "", // Handle null/undefined for CSV
        coupon.usage_limit_per_customer || "", // Handle null/undefined for CSV
        coupon.start_date,
        coupon.end_date,
        coupon.is_active ? "1" : "0", // Convert boolean to "1" or "0" string for CSV
        coupon.created_at,
        coupon.updated_at,
      ]
        .map((field) => {
          // Simple CSV escape:
          // 1. Convert field to string
          // 2. Wrap in double quotes if it contains comma, double quote, or newline
          // 3. Escape existing double quotes by doubling them
          const stringField = String(field); // Ensure it's a string
          if (
            stringField.includes(",") ||
            stringField.includes('"') ||
            stringField.includes("\n")
          ) {
            return `"${stringField.replace(/"/g, '""')}"`;
          }
          return stringField; // Return as string even if no special chars
        })
        .join(",");
      csvContent += row + "\n";
    });

    // Set headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="coupons_export.csv"'
    );
    res.status(200).send(csvContent);
  } catch (err) {
    console.error("Error exporting coupons:", err.message);
    res
      .status(500)
      .json({ message: "Failed to export coupons.", error: err.message });
  }
});

// --- GET Single Coupon by ID ---
// This route will correctly respond to GET /api/admin/coupons/:id
router.get("/:id", async (req, res) => {
  const dbGet = req.app.locals.dbGet;
  if (!dbGet) {
    return res
      .status(500)
      .json({ message: "Database `dbGet` helper not initialized." });
  }

  const { id } = req.params;
  try {
    const coupon = await dbGet("SELECT * FROM coupons WHERE id = ?", [id]);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json(convertSqliteBoolean(coupon));
  } catch (err) {
    console.error(`Error fetching coupon with ID ${id}:`, err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch coupon.", error: err.message });
  }
});

// --- POST Create New Coupon ---
// This route will correctly respond to POST /api/admin/coupons
router.post("/", async (req, res) => {
  const dbRun = req.app.locals.dbRun;
  if (!dbRun) {
    return res
      .status(500)
      .json({ message: "Database `dbRun` helper not initialized." });
  }

  const {
    code,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    usage_limit_per_coupon,
    usage_limit_per_customer,
    start_date,
    end_date,
    is_active,
  } = req.body;

  if (
    !code ||
    !discount_type ||
    discount_value === undefined ||
    discount_value === null ||
    !start_date ||
    !end_date
  ) {
    return res.status(400).json({
      message:
        "Missing required coupon fields: code, discount type, discount value, start date, or end date.",
    });
  }

  if (isNaN(parseFloat(discount_value))) {
    return res
      .status(400)
      .json({ message: "Discount value must be a number." });
  }

  const isActiveInt = is_active ? 1 : 0;

  try {
    const result = await dbRun(
      `INSERT INTO coupons (
          code,
          description,
          discount_type,
          discount_value,
          minimum_spend,
          usage_limit_per_coupon,
          usage_limit_per_customer,
          start_date,
          end_date,
          is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code,
        description || null,
        discount_type,
        parseFloat(discount_value),
        minimum_spend === undefined || minimum_spend === ""
          ? null
          : parseFloat(minimum_spend),
        usage_limit_per_coupon === undefined || usage_limit_per_coupon === ""
          ? null
          : parseInt(usage_limit_per_coupon, 10),
        usage_limit_per_customer === undefined ||
        usage_limit_per_customer === ""
          ? null
          : parseInt(usage_limit_per_customer, 10),
        start_date,
        end_date,
        isActiveInt,
      ]
    );
    res.status(201).json({
      message: "Coupon created successfully!",
      couponId: result.id,
    });
  } catch (err) {
    console.error("Error creating coupon:", err.message);
    if (err.message.includes("UNIQUE constraint failed: coupons.code")) {
      return res.status(409).json({
        message: "Coupon code already exists. Please use a different code.",
        error: err.message,
      });
    }
    res
      .status(500)
      .json({ message: "Failed to create coupon.", error: err.message });
  }
});

// --- PUT Update Existing Coupon ---
// This route will correctly respond to PUT /api/admin/coupons/:id
router.put("/:id", async (req, res) => {
  const dbRun = req.app.locals.dbRun;
  if (!dbRun) {
    return res
      .status(500)
      .json({ message: "Database `dbRun` helper not initialized." });
  }

  const { id } = req.params;
  const {
    code,
    description,
    discount_type,
    discount_value,
    minimum_spend,
    usage_limit_per_coupon,
    usage_limit_per_customer,
    start_date,
    end_date,
    is_active,
  } = req.body;

  if (
    !code ||
    !discount_type ||
    discount_value === undefined ||
    discount_value === null ||
    !start_date ||
    !end_date
  ) {
    return res
      .status(400)
      .json({ message: "Missing required coupon fields for update." });
  }

  if (isNaN(parseFloat(discount_value))) {
    return res
      .status(400)
      .json({ message: "Discount value must be a number." });
  }

  const isActiveInt = is_active ? 1 : 0;

  try {
    const result = await dbRun(
      `UPDATE coupons SET
          code = ?,
          description = ?,
          discount_type = ?,
          discount_value = ?,
          minimum_spend = ?,
          usage_limit_per_coupon = ?,
          usage_limit_per_customer = ?,
          start_date = ?,
          end_date = ?,
          is_active = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
      [
        code,
        description || null,
        discount_type,
        parseFloat(discount_value),
        minimum_spend === undefined || minimum_spend === ""
          ? null
          : parseFloat(minimum_spend),
        usage_limit_per_coupon === undefined || usage_limit_per_coupon === ""
          ? null
          : parseInt(usage_limit_per_coupon, 10),
        usage_limit_per_customer === undefined ||
        usage_limit_per_customer === ""
          ? null
          : parseInt(usage_limit_per_customer, 10),
        start_date,
        end_date,
        isActiveInt,
        id,
      ]
    );

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ message: "Coupon not found or no changes made." });
    }
    res.status(200).json({ message: "Coupon updated successfully!" });
  } catch (err) {
    console.error(`Error updating coupon with ID ${id}:`, err.message);
    if (err.message.includes("UNIQUE constraint failed: coupons.code")) {
      return res.status(409).json({
        message:
          "Coupon code already exists for another coupon. Please use a different code.",
        error: err.message,
      });
    }
    res
      .status(500)
      .json({ message: "Failed to update coupon.", error: err.message });
  }
});

// --- DELETE Coupon ---
// This route will correctly respond to DELETE /api/admin/coupons/:id
router.delete("/:id", async (req, res) => {
  const dbRun = req.app.locals.dbRun;
  if (!dbRun) {
    return res
      .status(500)
      .json({ message: "Database `dbRun` helper not initialized." });
  }

  const { id } = req.params;
  try {
    const result = await dbRun("DELETE FROM coupons WHERE id = ?", [id]);
    if (result.changes === 0) {
      return res.status(404).json({ message: "Coupon not found." });
    }
    res.status(200).json({ message: "Coupon deleted successfully!" });
  } catch (err) {
    console.error(`Error deleting coupon with ID ${id}:`, err.message);
    res
      .status(500)
      .json({ message: "Failed to delete coupon.", error: err.message });
  }
});

// Always export the router at the end of the file.
module.exports = router;
