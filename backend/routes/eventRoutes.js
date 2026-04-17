const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ─────────────────────────────────────────────────────────
// CREATE EVENT
// ─────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const { 
    title, 
    description, 
    date, 
    time, 
    location, 
    category, 
    user_email,
    price,
    access_type,
    capacity
  } = req.body || {};

  if (!title || !date || !location) {
    return res.status(400).json({ error: "Required fields missing." });
  }

  try {
    await db.execute({
      sql: `INSERT INTO events 
            (title, description, date, time, location, category, user_email, price, access_type, capacity, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        title,
        description ?? null,
        date,
        time ?? null,
        location,
        category ?? null,
        user_email ?? null,
        price ?? "0",
        access_type ?? "free",
        capacity ?? 0,
        new Date().toISOString()
      ],
    });

    res.status(201).json({ message: "Event created successfully." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// ─────────────────────────────────────────────────────────
// GET ALL EVENTS (WITH REAL SEATS COUNT)
// ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const result = await db.execute(`
      SELECT 
        e.*,
        COUNT(r.event_id) as total_registered
      FROM events e
      LEFT JOIN registrations r
        ON CAST(e.id AS Text) = CAST(r.event_id AS TEXT)
      GROUP BY e.id
      ORDER BY e.id DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});

// ─────────────────────────────────────────────────────────
// GET EVENTS BY USER
// ─────────────────────────────────────────────────────────
router.get("/mine", async (req, res) => {
  const { email } = req.query;

  try {
    const result = await db.execute({
      sql: `
        SELECT 
          e.*,
          COUNT(r.event_id) as total_registered
        FROM events e
        LEFT JOIN registrations r
          ON CAST(e.id AS Text) = CAST(r.event_id AS TEXT)
        WHERE e.user_email = ?
        GROUP BY e.id
        ORDER BY e.id DESC
      `,
      args: [email],
    });

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// ─────────────────────────────────────────────────────────
// REGISTER FOR EVENT
// ─────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { event_id, user_email } = req.body;

  if (!event_id || !user_email) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    // 1. Check if already registered
    const existing = await db.execute({
      sql: "SELECT * FROM registrations WHERE event_id = ? AND user_email = ?",
      args: [event_id, user_email],
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Already registered" });
    }

    // 2. Insert registration
    await db.execute({
      sql: `INSERT INTO registrations (event_id, user_email, created_at)
            VALUES (?, ?, ?)`,
      args: [event_id, user_email, new Date().toISOString()],
    });

    res.json({ message: "Registered successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// ─────────────────────────────────────────────────────────
// GET REGISTERED EVENT IDs FOR A USER
// ─────────────────────────────────────────────────────────
router.get("/registered", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Email required." });
  }

  try {
    const result = await db.execute({
      sql: "SELECT event_id FROM registrations WHERE user_email = ?",
      args: [email],
    });

    const ids = result.rows.map(r => r.event_id);
    res.json(ids);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


// ─────────────────────────────────────────────────────────
// DELETE EVENT
// ─────────────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute({
      sql: "DELETE FROM events WHERE id = ?",
      args: [id],
    });

    res.json({ message: "Event deleted." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB error" });
  }
});


module.exports = router;