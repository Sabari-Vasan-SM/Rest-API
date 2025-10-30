const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'data.db');
const db = new sqlite3.Database(dbFile);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function init() {
  // Create users table if not exists
  await run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL
    )`
  );

  // Seed with two users if table is empty
  const row = await get('SELECT COUNT(1) as cnt FROM users');
  if (row && row.cnt === 0) {
    await run('INSERT INTO users (name, email) VALUES (?, ?)', ['Vasan', 'vasan@example.com']);
    await run('INSERT INTO users (name, email) VALUES (?, ?)', ['Alex', 'alex@example.com']);
  }
}

async function getAllUsers() {
  return all('SELECT id, name, email FROM users ORDER BY id');
}

async function getUserById(id) {
  return get('SELECT id, name, email FROM users WHERE id = ?', [id]);
}

async function createUser({ name, email }) {
  const result = await run('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
  const created = await get('SELECT id, name, email FROM users WHERE id = ?', [result.lastID]);
  return created;
}

async function updateUser(id, { name, email }) {
  await run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
  return getUserById(id);
}

async function deleteUser(id) {
  await run('DELETE FROM users WHERE id = ?', [id]);
  return { id };
}

module.exports = {
  init,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
