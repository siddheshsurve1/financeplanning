const express = require('express');
const cors = require('cors');
const { query } = require('./db');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5173', // replace with your frontend URL
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Health check (simple, does not depend on tables)
app.get('/api/health/db', async (req, res) => {
  try {
    await query('SELECT 1'); 
    res.json({ status: '✅ Neon DB OK' });
  } catch (err) {
    res.status(500).json({
      status: '❌ Neon DB DOWN',
      error: err.message,
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

