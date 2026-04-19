const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];

    console.log("👉 EMAIL:", email);
    console.log("👉 INPUT PASSWORD:", password);
    console.log("👉 HASH IN DB:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

console.log("👉 MATCH RESULT:", isMatch);
    res.json({
    token: "dummy-token", // temporary
    user: {
    email: user.email,
    role: "admin"
  }
  });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🔥 RESET PASSWORD (TEMP)
router.get("/reset", async (req, res) => {
  try {
    const bcrypt = require("bcryptjs");
    const hash = await bcrypt.hash("123456", 10);

    await db.query(
      "UPDATE users SET password = ? WHERE email = ?",
      [hash, "admin@gmail.com"]
    );

    res.send("✅ Password reset to 123456");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error resetting password");
  }
});

module.exports = router;