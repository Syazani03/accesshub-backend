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
const bcrypt = require("bcryptjs");

// AUTO CREATE TABLE + USER
(async () => {
  try {
    const hash = await bcrypt.hash("123456", 10);

    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        password VARCHAR(255)
      )
    `);

    await db.query(`DELETE FROM users WHERE email = 'admin@gmail.com'`);

    await db.query(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      ["admin@gmail.com", hash]
    );

    console.log("✅ USER RESET SUCCESS: admin@gmail.com / 123456");

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
})();