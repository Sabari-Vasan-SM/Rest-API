// Import express
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to read JSON bodies

// Serve static client files from the `client` folder
app.use(express.static(path.join(__dirname, "client")));

// NOTE: users are stored in SQLite database (see db.js)

// ✅ READ all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ READ one user
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await db.getUserById(parseInt(req.params.id));
    user ? res.json(user) : res.status(404).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ CREATE new user
app.post("/api/users", async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    const newUser = await db.createUser({ name, email });
    res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ UPDATE user (PUT)
app.put("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    const existing = await db.getUserById(id);
    if (!existing) return res.status(404).json({ message: 'User not found' });
    const updated = await db.updateUser(id, { name, email });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ DELETE user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.getUserById(id);
    if (!existing) return res.status(404).json({ message: 'User not found' });
    await db.deleteUser(id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server (allow overriding port via environment variable)
const PORT = process.env.PORT || 5000;
// Ensure GET / returns the client index if requested
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Initialize DB then start server
db.init().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB', err);
  process.exit(1);
});
