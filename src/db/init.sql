-- =============================================================
-- Database Initialization Script
-- This file runs automatically when PostgreSQL container starts
-- for the first time (mounted to /docker-entrypoint-initdb.d/)
-- =============================================================

-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,           -- Auto-incrementing primary key
  name VARCHAR(100) NOT NULL,      -- User's full name (required)
  email VARCHAR(150) UNIQUE NOT NULL,  -- Email must be unique (required)
  created_at TIMESTAMP DEFAULT NOW()   -- Auto-set creation timestamp
);

-- Insert some sample data for testing (optional)
INSERT INTO users (name, email) VALUES 
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Bob Wilson', 'bob@example.com')
ON CONFLICT (email) DO NOTHING;  -- Prevent errors if data already exists
