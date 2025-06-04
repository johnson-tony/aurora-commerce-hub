const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

// --- Import your specialized routers ---
// These paths are relative to the server.js file
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const publicCategoryRoutes = require("./routes/publicCategoryRoutes");

const app = express();
const PORT = 5000;

// --- Global Middleware (applies to all requests) ---
app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json({ limit: "50mb" })); // Parses JSON request bodies, allows large payloads for images
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serves static files from the 'uploads' directory

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
// These are defined here and are attached to app.locals so routers can access them.
// This avoids creating new DB connections in each router file.
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

// Admin Category APIs: All requests starting with /api/admin/categories
// will be handled by the adminCategoryRoutes router.
app.use("/api/admin/categories", adminCategoryRoutes);

// Public Category APIs: All requests starting with /api/categories
// will be handled by the publicCategoryRoutes router.
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
