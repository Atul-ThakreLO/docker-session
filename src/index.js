/**
 * Express Application Entry Point
 *
 * This is the main entry point for our User Management API.
 * It initializes Express, connects to the database, and starts the server.
 */

// Load environment variables from .env file
// IMPORTANT: This must be called before any other imports that use env vars
require("dotenv").config();

const express = require("express");
const { connectWithRetry } = require("./db");
const usersRouter = require("./routes/users");

// Create Express application instance
const app = express();

// Get port from environment variable or use default
const PORT = process.env.PORT || 3000;

// =============================================================
// Middleware Configuration
// =============================================================

// Parse JSON request bodies
// This allows us to access req.body for POST/PUT requests with JSON data
app.use(express.json());

// Parse URL-encoded request bodies (for form submissions)
app.use(express.urlencoded({ extended: true }));

// Simple request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

// =============================================================
// Routes Configuration
// =============================================================

// Health check endpoint - useful for Docker health checks and monitoring
app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Mount the users router at /api/users
// All routes in usersRouter will be prefixed with /api/users
app.use("/api/users", usersRouter);

// =============================================================
// 404 Handler - Catch all unmatched routes
// =============================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// =============================================================
// Global Error Handler
// =============================================================
app.use((error, req, res, next) => {
  console.error("🚨 Unhandled Error:", error.message);
  res.status(500).json({
    success: false,
    data: null,
    message: "An unexpected error occurred",
  });
});

// =============================================================
// Application Startup
// =============================================================

/**
 * Start the server
 *
 * We first attempt to connect to the database with retry logic,
 * then start the Express server. This ensures the database is
 * available before accepting requests.
 */
async function startServer() {
  try {
    console.log("🚀 Starting User Management API...");
    console.log("📦 Environment:", process.env.NODE_ENV || "development");

    // Wait for database connection with retry logic
    // This is crucial for Docker where PostgreSQL may take time to start
    await connectWithRetry();

    // Start the HTTP server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("═══════════════════════════════════════════════");
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/`);
      console.log(`👥 Users API:    http://localhost:${PORT}/api/users`);
      console.log("═══════════════════════════════════════════════");
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

// Start the application
startServer();
