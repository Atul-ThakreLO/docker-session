require("dotenv").config();

const express = require("express");
const { connectWithRetry } = require("./db");
const usersRouter = require("./routes/users");

const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`📨 ${new Date().toISOString()} | ${req.method} ${req.path}`);
  next();
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.use("/api/users", usersRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

app.use((error, req, res, next) => {
  console.error("🚨 Unhandled Error:", error.message);
  res.status(500).json({
    success: false,
    data: null,
    message: "An unexpected error occurred",
  });
});

async function startServer() {
  try {
    console.log("🚀 Starting User Management API...");
    console.log("📦 Environment:", process.env.NODE_ENV || "development");

    await connectWithRetry();

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

process.on("SIGTERM", () => {
  console.log("📴 SIGTERM received. Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("📴 SIGINT received. Shutting down gracefully...");
  process.exit(0);
});

startServer();
