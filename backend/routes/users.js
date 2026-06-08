const express = require('express');
const router = express.Router();
const { getDb } = require('../database/connection');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

// GET /api/users/:username
router.get('/:username', optionalAuth, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(req.params.username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const products = db.prepare('SELECT * FROM products WHERE maker_id = ? AND status = "approved" ORDER BY created_at DESC').all(user.id);
  const followersCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE following_id = ?').get(user.id).count;
  const followingCount = db.prepare('SELECT COUNT(*) as count FROM follows WHERE follower_id = ?').get(user.id).count;
  const isFollowing = req.user ? !!db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, user.id) : false;

  const { password_hash, ...safeUser } = user;
  res.json({ user: { ...safeUser, followersCount, followingCount, productsCount: products.length, isFollowing }, products });
});

// POST /api/users/:username/follow
router.post('/:username/follow', authMiddleware, (req, res) => {
  const db = getDb();
  const target = db.prepare('SELECT id FROM users WHERE username = ?').get(req.params.username);
  if (!target) return res.status(404).json({ error: 'User not found' });
  if (target.id === req.user.id) return res.status(400).json({ error: 'Cannot follow yourself' });

  const existing = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').get(req.user.id, target.id);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(req.user.id, target.id);
    res.json({ following: false });
  } else {
    db.prepare('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)').run(req.user.id, target.id);
    res.json({ following: true });
  }
});

module.exports = router;
