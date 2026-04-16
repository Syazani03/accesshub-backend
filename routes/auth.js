const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET = "secretkey"; // later move to .env

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const [users] = await db.query(
  "SELECT * FROM users WHERE email = ?",
  [email]
  );
  if (users.length === 0) {
    return res.status(400).json({ message: "User not found" });
  }

  const user = users[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    SECRET,
    { expiresIn: "1d" }
  );

  res.json({
    token,
    user: {
      id: user.id,
      role: user.role
    }
  });
});

module.exports = router;