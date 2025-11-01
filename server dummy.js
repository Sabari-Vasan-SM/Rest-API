
// Import core dependencies
const express = require("express");
const cors = require("cors");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Import custom modules
const db = require("./db");
const auth = require("./auth");

// Create Express app
const app = express();

// ============================================================
// 🧩 Middleware Configuration
// ============================================================

// Enable CORS for cross-origin access
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Enhanced security headers
app.use(helmet());

// Logging middleware with timestamps
app.use(morgan("dev"));

// Simulate network latency (for dev testing)
app.use((req, res, next) => {
  const delay = Math.floor(Math.random() * 300); // 0–300ms delay
  setTimeout(() => next(), delay);
});

// Basic request rate limiter (avoid abuse)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // max 60 requests/minute
  message: { message: "Too many requests, chill for a minute!" },
});
app.use(limiter);

// Serve static client files (e.g., React frontend)
app.use(express.static(path.join(__dirname, "client")));

// Mount authentication routes
app.use("/auth", auth.router);

// ============================================================
// 🔒 Validation Middleware
// ============================================================

function validateUser(req, res, next) {
  const { name, email } = req.body;
  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "Validation failed: name and email are required" });
  }
  if (!email.includes("@")) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  next();
}

// ============================================================
// 👥 User Routes
// ============================================================

// ✅ READ all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err);
    res.status(500).json({ message: "Server error while fetching users" });
  }
});

// ✅ READ one user
app.get("/api/users/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await db.getUserById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ CREATE new user
app.post("/api/users", auth.requireAuth, validateUser, async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await db.createUser({ name, email });
    res.status(201).json({
      message: "User created successfully",
      data: newUser,
    });
  } catch (err) {
    console.error("❌ Error creating user:", err);
    res.status(500).json({ message: "Server error while creating user" });
  }
});

// ✅ UPDATE user
app.put("/api/users/:id", auth.requireAuth, validateUser, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email } = req.body;
    const existing = await db.getUserById(id);
    if (!existing) return res.status(404).json({ message: "User not found" });

    const updated = await db.updateUser(id, { name, email });
    res.status(200).json({
      message: "User updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ message: "Server error while updating user" });
  }
});

// ✅ DELETE user
app.delete("/api/users/:id", auth.requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await db.getUserById(id);
    if (!existing) return res.status(404).json({ message: "User not found" });

    await db.deleteUser(id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    res.status(500).json({ message: "Server error while deleting user" });
  }
});

// ✅ SEARCH users (by name or email)
app.get("/api/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query 'q' is required" });

    const users = await db.getAllUsers();
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.email.toLowerCase().includes(q.toLowerCase())
    );

    res.status(200).json({
      message: `Found ${filtered.length} users matching "${q}"`,
      results: filtered,
    });
  } catch (err) {
    console.error("❌ Error searching users:", err);
    res.status(500).json({ message: "Server error during search" });
  }
});

// ============================================================
// 🧱 Root and Fallback Routes
// ============================================================

// Serve client index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ============================================================
// 🚀 Start Server after DB Init
// ============================================================

const PORT = process.env.PORT || 5000;

db.init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server is live at: http://localhost:${PORT}`);
      console.log("📦 Database initialized and ready");
    });
  })
  .catch((err) => {
    console.error("🔥 Failed to initialize DB:", err);
    process.exit(1);
  });

// ============================================================
// 🧰 Graceful Shutdown Handling
// ============================================================

process.on("SIGINT", () => {
  console.log("\n🛑 Server shutting down...");
  process.exit(0);
});
