CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,          
  name VARCHAR(100) NOT NULL,      
  email VARCHAR(150) UNIQUE NOT NULL,  
  created_at TIMESTAMP DEFAULT NOW()  
);

-- INSERT INTO users (name, email) VALUES 
--   ('John Doe', 'john@example.com'),
--   ('Jane Smith', 'jane@example.com'),
--   ('Bob Wilson', 'bob@example.com')
-- ON CONFLICT (email) DO NOTHING;
