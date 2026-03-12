/**
 * Mini AI LinkedIn - Express Server
 * Main server file that initializes all services and routes
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware Configuration
// ============================================

// CORS - Allow frontend to communicate with backend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve local uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ============================================
// API Routes
// ============================================

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ============================================
// Frontend Route Handling
// ============================================

// Serve frontend pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/signup.html'));
});

app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/feed.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/profile.html'));
});

app.get('/edit-profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/edit-profile.html'));
});

app.get('/notifications', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/notifications.html'));
});

// ============================================
// Error Handling
// ============================================

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================
// Database Connection & Server Start
// ============================================

async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mini-ai-linkedin';
    
    // Check if we should use MongoMemoryServer as fallback
    if (process.env.NODE_ENV !== 'production') {
      try {
        const mongooseOpts = {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 2000 // Fast fail for local check
        };
        await mongoose.connect(mongoUri, mongooseOpts);
        console.log('✅ Connected to MongoDB');
      } catch (err) {
        console.warn('⚠️ Local MongoDB not found, starting MongoDB Memory Server...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB Memory Server');
      }
    } else {
      await mongoose.connect(mongoUri);
      console.log('✅ Connected to MongoDB');
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 Mini AI LinkedIn Server running on http://localhost:${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🔌 API Base: http://localhost:${PORT}/api`);
      console.log(`💚 Health Check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
