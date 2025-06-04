const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

// --- Import your specialized routers (the "chefs") ---
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const publicCategoryRoutes = require("./routes/publicCategoryRoutes"); // New public categories router

const app = express();
const PORT = 5000;

// --- Global Middleware (applies to all requests) ---
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increased body-parser limit
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Main SQLite Database Connection ---
// This connection is managed by the main server.js
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
  }
});

// IMPORTANT: Helper functions for database queries.
// These are defined here and can be passed to routers if needed,
// but for simplicity, we've duplicated them in the router files for now.
// In a more advanced setup, you'd create a 'db.js' utility file.
const dbRun = (query, params = []) => {
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

const dbAll = (query, params = []) => {
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


// --- Mount your routers (assign paths to the "chefs") ---

// Admin Category APIs: All requests starting with /api/admin/categories go to adminCategoryRoutes
app.use("/api/admin/categories", adminCategoryRoutes);

// Public Category APIs: All requests starting with /api/categories go to publicCategoryRoutes
app.use("/api/categories", publicCategoryRoutes);


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
