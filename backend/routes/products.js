const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/connection');
const { authMiddleware, optionalAuth, adminOnly } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// GET /api/products - List products with filtering, sorting, pagination
router.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  const { category, search, sort = 'trending', page = 1, limit = 20, status = 'approved' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where = ['p.status = ?'];
  let params = [status];

  if (category && category !== 'All') {
    where.push('p.category = ?');
    params.push(category);
  }
  if (search) {
    where.push('(p.name LIKE ? OR p.tagline LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const orderMap = {
    trending: 'p.votes_count DESC, p.created_at DESC',
    newest: 'p.created_at DESC',
    top: 'p.votes_count DESC',
  };
  const order = orderMap[sort] || orderMap.trending;

  const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
  const query = `
    SELECT p.*, u.name as maker_name, u.username as maker_username, u.role as maker_role
    FROM products p JOIN users u ON p.maker_id = u.id
    ${whereStr} ORDER BY ${order} LIMIT ? OFFSET ?
  `;

  const products = db.prepare(query).all(...params, parseInt(limit), offset);
  const total = db.prepare(`SELECT COUNT(*) as count FROM products p ${whereStr}`).get(...params);

  const hasVoted = req.user
    ? new Set(db.prepare('SELECT product_id FROM votes WHERE user_id = ?').all(req.user.id).map(v => v.product_id))
    : new Set();

  res.json({
    products: products.map(p => formatProduct(p, hasVoted)),
    pagination: { page: parseInt(page), limit: parseInt(limit), total: total.count },
  });
});

// GET /api/products/:id
router.get('/:id', optionalAuth, (req, res) => {
  const db = getDb();
  const p = db.prepare(`
    SELECT p.*, u.name as maker_name, u.username as maker_username, u.role as maker_role
    FROM products p JOIN users u ON p.maker_id = u.id WHERE p.id = ?
  `).get(req.params.id);

  if (!p) return res.status(404).json({ error: 'Product not found' });

  db.prepare("UPDATE products SET views_count = views_count + 1 WHERE id = ?").run(req.params.id);

  const hasVoted = req.user
    ? !!db.prepare('SELECT id FROM votes WHERE user_id = ? AND product_id = ?').get(req.user.id, req.params.id)
    : false;

  res.json({ product: formatProduct(p, null, hasVoted) });
});

// POST /api/products
router.post('/', authMiddleware, validate('product'), (req, res) => {
  const db = getDb();
  const { name, tagline, description, category, websiteUrl, githubUrl, tags } = req.body;
  const id = uuidv4();

  db.prepare(`
    INSERT INTO products (id, name, tagline, description, category, tags, website_url, github_url, maker_id, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `).run(id, name, tagline, description, category, JSON.stringify(tags || []), websiteUrl, githubUrl || '', req.user.id);

  const product = db.prepare('SELECT p.*, u.name as maker_name, u.username as maker_username FROM products p JOIN users u ON p.maker_id = u.id WHERE p.id = ?').get(id);
  res.status(201).json({ product: formatProduct(product) });
});

// PUT /api/products/:id
router.put('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (p.maker_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { name, tagline, description, category, websiteUrl, githubUrl, tags } = req.body;
  db.prepare(`
    UPDATE products SET name=?, tagline=?, description=?, category=?, website_url=?, github_url=?, tags=?, updated_at=datetime('now') WHERE id=?
  `).run(name||p.name, tagline||p.tagline, description||p.description, category||p.category, websiteUrl||p.website_url, githubUrl||p.github_url, JSON.stringify(tags||JSON.parse(p.tags)), req.params.id);

  const updated = db.prepare('SELECT p.*, u.name as maker_name, u.username as maker_username FROM products p JOIN users u ON p.maker_id = u.id WHERE p.id = ?').get(req.params.id);
  res.json({ product: formatProduct(updated) });
});

// DELETE /api/products/:id
router.delete('/:id', authMiddleware, (req, res) => {
  const db = getDb();
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Product not found' });
  if (p.maker_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted' });
});

// POST /api/products/:id/vote
router.post('/:id/vote', authMiddleware, (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM votes WHERE user_id = ? AND product_id = ?').get(req.user.id, req.params.id);

  if (existing) {
    db.prepare('DELETE FROM votes WHERE user_id = ? AND product_id = ?').run(req.user.id, req.params.id);
    db.prepare("UPDATE products SET votes_count = MAX(0, votes_count - 1) WHERE id = ?").run(req.params.id);
    res.json({ voted: false, message: 'Vote removed' });
  } else {
    db.prepare('INSERT INTO votes (id, user_id, product_id) VALUES (?, ?, ?)').run(uuidv4(), req.user.id, req.params.id);
    db.prepare("UPDATE products SET votes_count = votes_count + 1 WHERE id = ?").run(req.params.id);
    res.json({ voted: true, message: 'Voted!' });
  }
});

function formatProduct(p, votedSet = null, hasVoted = false) {
  return {
    id: p.id,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
    thumbnail: p.thumbnail,
    websiteUrl: p.website_url,
    githubUrl: p.github_url,
    votesCount: p.votes_count,
    commentsCount: p.comments_count,
    viewsCount: p.views_count,
    featured: p.featured === 1,
    status: p.status,
    createdAt: p.created_at,
    maker: { id: p.maker_id, name: p.maker_name, username: p.maker_username, role: p.maker_role },
    hasVoted: votedSet ? votedSet.has(p.id) : hasVoted,
  };
}

module.exports = router;
