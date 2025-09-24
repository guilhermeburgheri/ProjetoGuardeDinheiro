const express = require("express");
const db = require("../db");
const router = express.Router();

// definir meta
router.post("/", (req, res) => {
  const { userId, goal_percentage, salary } = req.body;

  db.run(
    "INSERT INTO saving_goals (user_id, goal_percentage, salary) VALUES (?, ?, ?)",
    [userId, goal_percentage, salary],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// ver meta
router.get("/:userId", (req, res) => {
  db.get("SELECT * FROM saving_goals WHERE user_id = ?", [req.params.userId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

module.exports = router;
