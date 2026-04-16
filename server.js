const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ================= MIDDLEWARE =================
app.use(cors());
app.use(express.json());

// ================= ROUTES =================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/user"));
app.use("/api/departments", require("./routes/departments"));
app.use("/api/links", require("./routes/links"));

// ================= HEALTH CHECK =================
app.get("/", (req, res) => {
  res.send("🚀 AccessHub API is running...");
});

// ================= 404 HANDLER =================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ================= GLOBAL ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ================= START SERVER =================
const PORT = process.env.PORT || 3000; // ✅ IMPORTANT FOR RENDER

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

const db = require("./db");

// AUTO CREATE TABLE + USER
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        password VARCHAR(255)
      )
    `);

    console.log("✅ users table ready");

    // insert test user (only if not exist)
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      ["admin@gmail.com"]
    );

    if (rows.length === 0) {
      await db.query(`
        INSERT INTO users (email, password)
        VALUES (
          'admin@gmail.com',
          '$2a$10$8wYpR1l8Qz1l8k5rH6l1m.5zq5nCkZJrQ0YyYyYyYyYyYyYyYyYyY'
        )
      `);

      console.log("✅ test user created");
    }

  } catch (err) {
    console.error("❌ DB setup error:", err);
  }
})();