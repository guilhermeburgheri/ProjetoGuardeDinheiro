const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();

// registro
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    function (err) {
      if (err) return res.status(400).json({ error: "Usuário já existe" });
      res.json({ message: "Usuário criado com sucesso!" });
    }
  );
});

// login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get("SELECT * FROM users WHERE username = ?", [username], async (err, row) => {
    if (!row) return res.status(400).json({ error: "Usuário não encontrado" });

    const valid = await bcrypt.compare(password, row.password);
    if (!valid) return res.status(401).json({ error: "Senha inválida" });

    res.json({ message: "Login bem-sucedido", userId: row.id });
  });
});

module.exports = router;
