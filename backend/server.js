const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase');
require('dotenv').config();

const app = express();

// Enable CORS for frontend client
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Root index endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Sri Ramakrishna Polytechnic College - AMS Backend API is running',
    healthCheck: '/api/health',
    endpoints: {
      attendance: '/api/attendance'
    }
  });
});

// Register API Routes
app.use('/api/attendance', require('./routes/attendance'));

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

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\n🎓 Attendance Management System Backend`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health\n`);
});
