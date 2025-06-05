const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const bcrypt = require("bcryptjs"); // <--- ADD THIS LINE
const jwt = require("jsonwebtoken");

// --- Import your specialized routers ---
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const publicCategoryRoutes = require("./routes/publicCategoryRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");
const publicProductRoutes = require("./routes/publicProductRoutes");
const adminSubcategoryRoutes = require("./routes/adminSubcategoryRoutes");
const authRoutes = require("./routes/authRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");

// Import the new subcategory router

const app = express();
const PORT = 5000;

// --- Global Middleware (applies to all requests) ---
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for potential Base64 images or large JSON payloads

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create directory if it doesn't exist
}
// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(uploadsDir));

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // Save uploaded files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent clashes
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname) // Keep original file extension
    );
  },
});

const upload = multer({ storage: storage });

// --- API Endpoint for Image Uploads ---
// This will handle POST requests to http://localhost:5000/api/upload/image
app.post("/api/upload/image", upload.single("productImage"), (req, res) => {
  // 'productImage' is the name of the input field in your frontend form
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Construct the public URL for the uploaded image
  // This URL must match how you're serving static files above (e.g., /uploads)
  const imageUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.status(200).json({
    message: "File uploaded successfully",
    imageUrl: imageUrl, // Send the public URL back to the frontend
  });
});

// --- Main SQLite Database Connection ---
const dbPath = path.resolve(__dirname, "ecommerce_admin.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Create categories table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        display_order INTEGER
      )`,
      (err) => {
        if (err) {
          console.error("Error creating categories table:", err.message);
        } else {
          console.log("Categories table ensured.");
        }
      }
    );

    // Create subcategories table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        image TEXT,
        display_order INTEGER,
        parent_id INTEGER NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creating subcategories table:", err.message);
        } else {
          console.log("Subcategories table ensured.");
        }
      }
    );

    // Create products table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        discount REAL DEFAULT 0,
        stock INTEGER NOT NULL,
        category TEXT NOT NULL,
        available INTEGER DEFAULT 1, -- SQLite uses 0 for false, 1 for true
        images TEXT -- Store as a JSON string of image URLs
      )
      `,
      (err) => {
        if (err) {
          console.error("Error creating products table:", err.message);
        } else {
          console.log("Products table ensured.");
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        reset_token TEXT,            
        reset_token_expires_at DATETIME  
      )`,
      (err) => {
        if (err) {
          console.error("Error creating users table:", err.message);
        } else {
          console.log("Users table ensured.");
        }
      }
    );
    // ... (after products table creation or similar)

    // Create shipping_details table if it doesn't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS shipping_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    full_name TEXT NOT NULL,
    address1 TEXT NOT NULL,
    address2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT NOT NULL,
    shipping_method TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,
      (err) => {
        if (err) {
          console.error("Error creating shipping_details table:", err.message);
        } else {
          console.log("Shipping details table ensured.");
        }
      }
    );

    // ... (rest of your server.js)
  }
});

// IMPORTANT: Helper functions for database queries.
// These are attached to app.locals so they can be accessed by routers.
app.locals.dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
};

app.locals.dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

// --- Mount your routers (assign base paths to the "chefs") ---
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/categories", adminSubcategoryRoutes); // Subcategory routes are nested under /api/admin/categories
app.use("/api/categories", publicCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/products", publicProductRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/checkout", checkoutRoutes);

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`Admin backend server running on http://localhost:${PORT}`);
});

// --- Close the database connection when the Node.js process exits ---
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Closed the database connection.");
    process.exit(0);
  });
});
