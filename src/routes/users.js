/**
 * User Routes Module
 *
 * This module contains all REST API endpoints for user management.
 * We use raw SQL queries (no ORM) for clarity and learning purposes.
 *
 * Endpoints:
 * - GET    /api/users      - Get all users
 * - GET    /api/users/:id  - Get single user by ID
 * - POST   /api/users      - Create a new user
 * - DELETE /api/users/:id  - Delete a user by ID
 */

const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * Standard response format
 * All responses follow this structure for consistency:
 * {
 *   success: boolean,
 *   data: any | null,
 *   message: string
 * }
 */

// =============================================================
// GET /api/users - Get all users
// =============================================================
router.get("/", async (req, res) => {
  try {
    // Execute SQL query to get all users, ordered by creation date
    const result = await db.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} users`,
    });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while fetching users",
    });
  }
});

// =============================================================
// GET /api/users/:id - Get single user by ID
// =============================================================
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid user ID format. ID must be a number.",
      });
    }

    // Execute parameterized query (prevents SQL injection)
    const result = await db.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [id],
    );

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: `User with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "User found",
    });
  } catch (error) {
    console.error("Error fetching user:", error.message);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while fetching user",
    });
  }
});

// =============================================================
// POST /api/users - Create a new user
// =============================================================
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Both name and email are required",
      });
    }

    // Validate email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid email format",
      });
    }

    // Insert new user and return the created record
    // RETURNING * gives us the inserted row including auto-generated fields
    const result = await db.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email, created_at",
      [name, email],
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error.message);

    // Handle unique constraint violation (duplicate email)
    if (error.code === "23505") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "A user with this email already exists",
      });
    }

    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while creating user",
    });
  }
});

// =============================================================
// DELETE /api/users/:id - Delete a user by ID
// =============================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Invalid user ID format. ID must be a number.",
      });
    }

    // Delete user and return the deleted record
    const result = await db.query(
      "DELETE FROM users WHERE id = $1 RETURNING id, name, email",
      [id],
    );

    // Check if user existed
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        message: `User with ID ${id} not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({
      success: false,
      data: null,
      message: "Internal server error while deleting user",
    });
  }
});

module.exports = router;
