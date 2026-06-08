const express = require('express');
const router = express.Router({ mergeParams: true });
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/connection');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');

// GET /api/products/:productId/comments
router.get('/', optionalAuth, (req, res) => {
  const db = getDb();
  const comments = db.prepare(`
    SELECT c.*, u.name as author_name, u.username as author_username
    FROM comments c JOIN users u ON c.user_id = u.id
    WHERE c.product_id = ? AND c.parent_id IS NULL
    ORDER BY c.created_at DESC
  `).all(req.params.productId);

  const result = comments.map(c => {
    const replies = db.prepare(`
      SELECT c.*, u.name as author_name, u.username as author_username
      FROM comments c JOIN users u ON c.user_id = u.id
      WHERE c.parent_id = ? ORDER BY c.created_at ASC
    `).all(c.id);
    return { ...formatComment(c), replies: replies.map(formatComment) };
  });

  res.json({ comments: result });
});

// POST /api/products/:productId/comments
router.post('/', authMiddleware, validate('comment'), (req, res) => {
  const db = getDb();
  const { content, parentId } = req.body;
  const id = uuidv4();

  db.prepare(`
    INSERT INTO comments (id, content, user_id, product_id, parent_id)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, content, req.user.id, req.params.productId, parentId || null);

  db.prepare("UPDATE products SET comments_count = comments_count + 1 WHERE id = ?").run(req.params.productId);

  const comment = db.prepare(`
    SELECT c.*, u.name as author_name, u.username as author_username
    FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?
  `).get(id);

  res.status(201).json({ comment: formatComment(comment) });
});

// DELETE /api/comments/:id
router.delete('/:commentId', authMiddleware, (req, res) => {
  const db = getDb();
  const c = db.prepare('SELECT * FROM comments WHERE id = ?').get(req.params.commentId);
  if (!c) return res.status(404).json({ error: 'Comment not found' });
  if (c.user_id !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  db.prepare('DELETE FROM comments WHERE id = ?').run(req.params.commentId);
  res.json({ message: 'Comment deleted' });
});

function formatComment(c) {
  return {
    id: c.id, content: c.content, likesCount: c.likes_count,
    createdAt: c.created_at, parentId: c.parent_id,
    author: { id: c.user_id, name: c.author_name, username: c.author_username },
  };
}

module.exports = router;
