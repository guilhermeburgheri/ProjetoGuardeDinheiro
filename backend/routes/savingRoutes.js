const express = require("express");
const db = require("../db");
const router = express.Router();

// definir ou atualizar a meta
router.post("/", (req, res) => {
  const { userId, goal_percentage, salary } = req.body;

  db.get("SELECT id From saving_goals WHERE user_id = ?", [userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });

    if (row) {

      db.run(
        "UPDATE saving_goals SET goal_percentage = ?, salary = ? WHERE user_id = ?",
        [goal_percentage, salary, userId],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });
          res.json({ message: "Meta atualizada com sucesso" });
        }
      );
    } else {
      db.run(
        "INSERT INTO saving_goals (user_id, goal_percentage, salary) VALUES (?, ?, ?)",
        [userId, goal_percentage, salary],
        function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: "Meta definida com sucesso" });
        }
      );
    }
  });
});

// ver meta
router.get("/:userId", (req, res) => {
  db.get("SELECT * FROM saving_goals WHERE user_id = ?", [req.params.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    //Garantir que o projeto não quebre se o usuário não tiver meta definida
    if (!row) return res.json({});
    res.json(row);
  });
});

module.exports = router;
