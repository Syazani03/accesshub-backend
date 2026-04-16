const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");

const SECRET_KEY = "accesshub_secret"; 

exports.login = (req, res) => {
  const { email, password } = req.body;

  console.log("LOGIN EMAIL:", email); // ✅ put INSIDE function

  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" });

    if (results.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = results[0];

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Wrong password" });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        SECRET_KEY,
        { expiresIn: "2h" }
      );

      res.json({
        message: "Login success",
        token
      });

    } catch (err) {
      res.status(500).json({ message: "Error comparing password" });
    }
  });
};