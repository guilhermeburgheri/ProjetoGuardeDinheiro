const express = require("express");
const db = require("../db");
const router = express.Router();

// adicionar gasto
router.post("/", (req, res) => {
  const { userId, description, amount, fixed } = req.body;
  const date = new Date().toISOString();

  db.run(
    "INSERT INTO expenses (user_id, description, amount, fixed, date) VALUES (?, ?, ?, ?, ?)",
    [userId, description, amount, fixed ? 1 : 0, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// excluir gasto
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM expenses WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Gasto não encontrado" });
    res.json({ message: "Gasto excluído com sucesso!" });
  });
});

// listar gastos do usuário
router.get("/:userId", (req, res) => {
  db.all("SELECT * FROM expenses WHERE user_id = ?", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
