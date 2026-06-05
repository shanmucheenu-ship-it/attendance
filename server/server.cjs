const path = require('path');
const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase.cjs');
require('dotenv').config();

const app = express();

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '../dist')));

// Enable CORS for frontend client
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Register API Routes
app.use('/api/attendance', require('./routes/attendance.cjs'));

// Health check and connection verification endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Perform a quick verification check with Supabase
    const { error } = await supabase
      .from('attendance_sessions')
      .select('*')
      .limit(1);

    const dbConnected = !error || error.code === 'PGRST205'; // PGRST205 is schema cache missing but authenticated

    res.json({
      status: 'ok',
      message: 'Express backend server running',
      database: dbConnected ? 'Connected' : 'Not Connected',
      dbError: error ? error.message : null
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Serve frontend routing for React Router
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🎓 Attendance Management System Backend`);
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`🏥 Health check at http://localhost:${PORT}/api/health\n`);
  });
}

module.exports = app;
