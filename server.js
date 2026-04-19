const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");
const bcrypt = require("bcryptjs");

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

// ================= START SERVER (after DB setup) =================
const PORT = process.env.PORT || 3000;

// 🔥 SETUP DATABASE ON START
async function setupDatabase() {
  try {
    // USERS
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255),
        password VARCHAR(255),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // DEPARTMENTS
    await db.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // LINKS
    await db.query(`
      CREATE TABLE IF NOT EXISTS links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        url VARCHAR(255),
        department_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // USER-DEPARTMENTS
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_departments (
        user_id INT,
        department_id INT
      )
    `);

    console.log("✅ ALL TABLES MATCHED WITH YOUR STRUCTURE");

    // ✅ INSERT DEFAULT DATA (ONLY IF EMPTY)

    const [dep] = await db.query("SELECT * FROM departments");
    if (dep.length === 0) {
      await db.query(`
        INSERT INTO departments (name)
        VALUES ('IT'), ('HR'), ('Finance')
      `);
      console.log("✅ Departments inserted");
    }

    const [links] = await db.query("SELECT * FROM links");
    if (links.length === 0) {
      await db.query(`
        INSERT INTO links (name, url, department_id)
        VALUES ('Google', 'https://google.com', 1)
      `);
      console.log("✅ Sample link inserted");
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = 'admin@gmail.com'");
    if (users.length === 0) {
      const hash = await bcrypt.hash("123456", 10);

      await db.query(`
        INSERT INTO users (email, password, role)
        VALUES (?, ?, ?)
      `, ["admin@gmail.com", hash, "admin"]);

      console.log("✅ Admin created");
    }

  } catch (err) {
    console.error("❌ DB SETUP ERROR:", err);
  }
}

// 🔥 START EVERYTHING
setupDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});