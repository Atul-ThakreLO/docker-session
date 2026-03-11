

const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "usersdb",
  max: 10, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
});

/**
 * @param {number} retries 
 * @param {number} delay
 */
async function connectWithRetry(retries = 10, delay = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      console.log("✅ Successfully connected to PostgreSQL database");

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
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = {
  pool,
  connectWithRetry,
  query: (text, params) => pool.query(text, params),
};
