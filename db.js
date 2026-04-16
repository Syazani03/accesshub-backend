const mysql = require("mysql2/promise");
require("dotenv").config();

// ================= DATABASE CONNECTION =================
const db = mysql.createPool(process.env.MYSQL_URL);

// ================= TEST CONNECTION =================
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
})();

module.exports = db;