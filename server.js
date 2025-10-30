// Import express
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // to read JSON bodies

// Serve static client files from the `client` folder
app.use(express.static(path.join(__dirname, "client")));

// Sample data (temporary; usually from a database)
let users = [
  { id: 1, name: "Vasan", email: "vasan@example.com" },
  { id: 2, name: "Alex", email: "alex@example.com" },
];

// ✅ READ all users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// ✅ READ one user
app.get("/api/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  user ? res.json(user) : res.status(404).json({ message: "User not found" });
});

// ✅ CREATE new user
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

// ✅ UPDATE user (PUT)
app.put("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  const userIndex = users.findIndex(u => u.id === id);
  if (userIndex !== -1) {
    users[userIndex] = { id, name, email };
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// ✅ DELETE user
app.delete("/api/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter(u => u.id !== id);
  res.json({ message: "User deleted" });
});

// Start server (allow overriding port via environment variable)
const PORT = process.env.PORT || 5000;
// Ensure GET / returns the client index if requested
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
