router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]   // ✅ VERY IMPORTANT
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = users[0];

    const bcrypt = require("bcryptjs");
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    res.json({
      message: "Login success",
      user: { id: user.id, role: user.role }
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR:", err);   // 👈 IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;