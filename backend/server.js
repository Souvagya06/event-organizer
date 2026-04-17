require("dotenv").config();

const db = require("./config/db");
const express = require("express");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");

const app = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);

// ── Page Routes ───────────────────────────────────────────────────────────────
app.get("/",              (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));
app.get("/events",        (req, res) => res.sendFile(path.join(__dirname, "../frontend/events.html")));
app.get("/event-details", (req, res) => res.sendFile(path.join(__dirname, "../frontend/event-details.html")));
app.get("/create-event",  (req, res) => res.sendFile(path.join(__dirname, "../frontend/create-event.html")));
app.get("/contact",       (req, res) => res.sendFile(path.join(__dirname, "../frontend/contact.html")));
app.get("/login",         (req, res) => res.sendFile(path.join(__dirname, "../frontend/login.html")));
app.get("/my-events",     (req, res) => res.sendFile(path.join(__dirname, "../frontend/my_events.html")));

// ── DB Init ───────────────────────────────────────────────────────────────────
async function initDB() {
  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT    NOT NULL,
        description TEXT,
        date        TEXT    NOT NULL,
        time        TEXT,
        location    TEXT    NOT NULL,
        category    TEXT,
        user_email  TEXT,
        price       TEXT,
        access_type TEXT,
        capacity    INTEGER,
        created_at  TEXT
      )
    `);
    console.log("Events table ready.");

    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT    NOT NULL,
        email      TEXT    UNIQUE NOT NULL,
        password   TEXT    NOT NULL,
        created_at TEXT
      )
    `);
    console.log("Users table ready.");
    
    await db.execute(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER,
      user_email TEXT,
      created_at TEXT,
      UNIQUE(event_id, user_email)
    )
  `);
  console.log("Registrations table ready.");
  } catch (err) {
    console.error("DB Init Error:", err);
    process.exit(1);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});