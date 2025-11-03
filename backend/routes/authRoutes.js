const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();

// listar todos os usuários (somente admin)
router.get("/users", (req, res) => {
  const { username } = req.query;

  if (username !== "admin") {
    return res.status(403).json({ error: "Acesso negado. Somente o admin pode ver usuários." });
  }

  db.all("SELECT id, username FROM users WHERE username != 'admin'", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// excluir usuário (somente admin)
router.delete("/users/:id", (req, res) => {
  const { username } = req.query;

  if (username !== "admin") {
    return res.status(403).json({ error: "Acesso negado. Somente o admin pode excluir usuários." });
  }

  db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json({ message: "Usuário excluído com sucesso!" });
  });
});

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
    if (!row) return res.status(400).json({ error: "Usuário ou senha incorretos." });

    const valid = await bcrypt.compare(password, row.password);
    if (!valid) return res.status(401).json({ error: "Usuário ou senha incorretos." });

    res.json({ message: "Login bem-sucedido", userId: row.id });
  });
});

module.exports = router;
