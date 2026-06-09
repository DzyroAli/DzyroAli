const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../database/connection');
const { validate } = require('../middleware/validate');
const { authMiddleware } = require('../middleware/auth');

const secret = () => process.env.JWT_SECRET || 'fallback_secret';
const expiry = () => process.env.JWT_EXPIRY || '7d';

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, username: user.username },
    secret(),
    { expiresIn: expiry() }
  );
}

router.post('/register', validate('register'), (req, res) => {
  const db = getDb();
  const { name, email, password } = req.body;

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'Email already registered' });

  const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_') + '_' + Date.now().toString(36);
  const passwordHash = bcrypt.hashSync(password, 12);
  const id = uuidv4();

  db.prepare(`
    INSERT INTO users (id, name, email, username, password_hash, role, email_verified)
    VALUES (?, ?, ?, ?, ?, 'user', 1)
  `).run(id, name, email.toLowerCase(), username, passwordHash);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = generateToken(user);

  res.status(201).json({
    message: 'Account created successfully',
    token,
    user: sanitizeUser(user),
  });
});

router.post('/login', validate('login'), (req, res) => {
  const db = getDb();
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = generateToken(user);
  res.json({ message: 'Login successful', token, user: sanitizeUser(user) });
});

router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: sanitizeUser(user) });
});

router.put('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const { name, bio, website, twitter, github } = req.body;
  db.prepare(`
    UPDATE users SET name = ?, bio = ?, website = ?, twitter = ?, github = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(name || '', bio || '', website || '', twitter || '', github || '', req.user.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({ user: sanitizeUser(user) });
});

function sanitizeUser(user) {
  const { password_hash, ...safe } = user;
  return safe;
}

module.exports = router;
