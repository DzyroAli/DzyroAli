require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./database/init');

// Init DB on startup
try { initDatabase(); } catch (e) { console.error('[DB] Init error:', e.message); }

const app = express();
const PORT = process.env.PORT || 3001;

// Security & middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests' } }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const commentRoutes = require('./routes/comments');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/products/:productId/comments', commentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Analytics endpoint
app.get('/api/analytics', (req, res) => {
  const { getDb } = require('./database/connection');
  const db = getDb();
  res.json({
    topProducts: db.prepare("SELECT id, name, votes_count, views_count FROM products WHERE status='approved' ORDER BY votes_count DESC LIMIT 10").all(),
    recentProducts: db.prepare("SELECT id, name, category, created_at FROM products WHERE status='approved' ORDER BY created_at DESC LIMIT 5").all(),
    categoryStats: db.prepare("SELECT category, COUNT(*) as count FROM products WHERE status='approved' GROUP BY category ORDER BY count DESC").all(),
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   ProductHunt UZ Backend Server      ║
║   Running on http://localhost:${PORT}   ║
╚══════════════════════════════════════╝
  `);
  console.log('[API] Endpoints:');
  console.log('  POST /api/auth/register');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/products');
  console.log('  POST /api/products');
  console.log('  GET  /api/admin/stats');
  console.log('  GET  /health');
});

module.exports = app;
