const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');
const { authMiddleware, adminOnly } = require('../middleware/auth');

router.use(authMiddleware, adminOnly);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  const db = getDb();
  const stats = {
    totalUsers: db.prepare('SELECT COUNT(*) as c FROM users').get().c,
    totalProducts: db.prepare('SELECT COUNT(*) as c FROM products').get().c,
    pendingProducts: db.prepare("SELECT COUNT(*) as c FROM products WHERE status = 'pending'").get().c,
    totalVotes: db.prepare('SELECT COUNT(*) as c FROM votes').get().c,
    totalComments: db.prepare('SELECT COUNT(*) as c FROM comments').get().c,
  };
  res.json(stats);
});

// GET /api/admin/products?status=pending
router.get('/products', (req, res) => {
  const db = getDb();
  const { status = 'pending' } = req.query;
  const where = status === 'all' ? '' : 'WHERE p.status = ?';
  const params = status === 'all' ? [] : [status];
  const products = db.prepare(`
    SELECT p.*, u.name as maker_name, u.email as maker_email
    FROM products p JOIN users u ON p.maker_id = u.id ${where} ORDER BY p.created_at DESC
  `).all(...params);
  res.json({ products });
});

// PUT /api/admin/products/:id/approve
router.put('/products/:id/approve', (req, res) => {
  const db = getDb();
  db.prepare("UPDATE products SET status = 'approved', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json({ message: 'Product approved' });
});

// PUT /api/admin/products/:id/reject
router.put('/products/:id/reject', (req, res) => {
  const db = getDb();
  db.prepare("UPDATE products SET status = 'rejected', updated_at = datetime('now') WHERE id = ?").run(req.params.id);
  res.json({ message: 'Product rejected' });
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  const db = getDb();
  const users = db.prepare('SELECT id, name, email, username, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', (req, res) => {
  const db = getDb();
  const { role } = req.body;
  if (!['admin', 'creator', 'user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, req.params.id);
  res.json({ message: 'Role updated' });
});

module.exports = router;
