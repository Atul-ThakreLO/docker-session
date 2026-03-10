/**
 * Database Connection Module
 *
 * This module creates a PostgreSQL connection pool and exports it
 * for use throughout the application. The pool manages multiple
 * connections efficiently.
 *
 * IMPORTANT: The connectWithRetry function is crucial for Docker!
 * PostgreSQL takes a few seconds to initialize, but our Node.js app
 * starts almost immediately. Without retry logic, the app would crash.
 */

const { Pool } = require("pg");

// Create a connection pool using environment variables
// Pool automatically manages connection lifecycle
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "usersdb",
  // Pool configuration
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection
});

/**
 * Connect to database with retry logic
 *
 * WHY THIS IS NEEDED IN DOCKER:
 * - Docker Compose starts services in order (depends_on)
 * - BUT depends_on only waits for container to START, not be READY
 * - PostgreSQL needs ~5-10 seconds to initialize on first run
 * - This function retries every 3 seconds until connection succeeds
 *
 * @param {number} retries - Number of retry attempts (default: 10)
 * @param {number} delay - Delay between retries in ms (default: 3000)
 */
async function connectWithRetry(retries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Attempt to connect to the database
      const client = await pool.connect();
      console.log("✅ Successfully connected to PostgreSQL database");

      // Release the client back to the pool
      client.release();
      return true;
    } catch (error) {
      console.log(
        `⏳ Database connection attempt ${attempt}/${retries} failed`,
      );
      console.log(`   Error: ${error.message}`);

      if (attempt === retries) {
        console.error("❌ Could not connect to database after maximum retries");
        throw error;
      }

      console.log(`   Retrying in ${delay / 1000} seconds...`);
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Export the pool and connectWithRetry function
module.exports = {
  pool,
  connectWithRetry,
  // Helper method for running queries
  query: (text, params) => pool.query(text, params),
};
