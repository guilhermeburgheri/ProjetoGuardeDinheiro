const express = require("express");
const db = require("../db");
const router = express.Router();

// adicionar gasto ou receita
router.post("/", (req, res) => {
  const {
    userId,
    description,
    amount,
    fixed,
    recurrence_type,
    months_duration,
    date,
    kind,
  } = req.body;

  if (!userId || !description || amount == null) {
    return res.status(400).json({ error: "Dados incompletos" });
  }

  const value = Math.abs(Number(amount));
  const movementKind = kind === "income" ? "income" : "expense";
  const recurrenceType = movementKind === "income" ? "once" : (recurrence_type || "once");
  const isFixed = movementKind === "expense" && !!fixed;
  const monthsDuration = movementKind === "expense" && recurrenceType === "months"
    ? Math.max(1, Number(months_duration || 1))
    : null;

  const now = new Date();
  const baseDate = date ? new Date(date) : now;
  if (Number.isNaN(baseDate.getTime())) {
    return res.status(400).json({ error: "Data inválida" });
  }
  const savedDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1).toISOString();

  db.run(
    `INSERT INTO expenses
      (user_id, description, amount, fixed, date, recurrence_type, months_duration, kind)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      description,
      value,
      isFixed ? 1 : 0,
      savedDate,
      recurrenceType,
      monthsDuration,
      movementKind,
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// listar gastos do usuário
router.get("/:userId", (req, res) => {
  db.all("SELECT *, COALESCE(kind, 'expense') AS kind FROM expenses WHERE user_id = ? ORDER BY date DESC", [req.params.userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
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

module.exports = router;
