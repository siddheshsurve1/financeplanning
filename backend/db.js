const { Pool } = require('pg');
require('dotenv').config();


// Neon PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test DB connection
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Connected to Neon PostgreSQL database');
  } catch (error) {
    console.error('❌ Failed to connect to Neon PostgreSQL database');
    console.error(error.message);
    process.exit(1);
  }
})();

pool.on('error', (err) => {
  console.error('❌ Unexpected PostgreSQL error', err);
  process.exit(1);
});

const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

module.exports = { pool, query };
