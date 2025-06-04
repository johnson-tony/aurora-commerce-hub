const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

// --- Import your specialized routers ---
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const publicCategoryRoutes = require("./routes/publicCategoryRoutes");
const adminProductRoutes = require("./routes/adminProductRoutes");

const app = express();
const PORT = 5000;

// --- Global Middleware (applies to all requests) ---
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased limit for potential Base64 images or large JSON payloads

// --- Image Uploads Directory Setup ---
// This assumes index.js is directly in the 'backend' folder
const uploadsDir = path.join(__dirname, "uploads");

// Ensure the 'uploads' directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true }); // Create directory if it doesn't exist
  console.log(`Created uploads directory at: ${uploadsDir}`);
} else {
  console.log(`Uploads directory already exists at: ${uploadsDir}`);
}

// Serve static files from the 'uploads' directory
// Requests to http://localhost:5000/uploads/... will be served from D:\aurora-commerce-hub\backend\uploads
app.use("/uploads", express.static(uploadsDir));
console.log(`Serving static files from /uploads at: ${uploadsDir}`);

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Check if the uploads directory exists before calling cb
    if (!fs.existsSync(uploadsDir)) {
      // This should ideally be caught by the fs.mkdirSync above, but good for robustness
      console.error(
        `Multer destination error: Directory not found - ${uploadsDir}`
      );
      return cb(new Error("Uploads directory not found or not writable"), null);
    }
    cb(null, uploadsDir); // Save uploaded files to the 'uploads' directory
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent clashes
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Use the original extension
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Multer instance for handling uploads
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
      )`,
      (err) => {
        if (err) {
          console.error("Error creating products table:", err.message);
        } else {
          console.log("Products table ensured.");
        }
      }
    );
  }
});

// IMPORTANT: Helper functions for database queries.
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
app.use("/api/categories", publicCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);

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
