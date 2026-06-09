const Database = require('better-sqlite3');
const path = require('path');

let db = null;

function getDb() {
  if (!db) {
    db = new Database(path.join(__dirname, '..', 'database.db'));
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function closeDb() {
  if (db) { db.close(); db = null; }
}

module.exports = { getDb, closeDb };
