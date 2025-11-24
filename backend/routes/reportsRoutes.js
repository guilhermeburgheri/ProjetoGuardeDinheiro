const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/monthly-expenses", (req, res) => {
  const userId = Number(req.query.userId);
  const year = Number(req.query.year);

  if (!userId || !year) return res.status(400).json({ error: "userId e year são obrigatórios" });

  db.all("SELECT * FROM expenses WHERE user_id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const totals = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, total: 0 }));

    const addToMonth = (y, m, value) => {
      if (y === year && m >= 1 && m <= 12) totals[m - 1].total += Number(value || 0);
    };

    for (const e of rows) {
      const created = e.date ? new Date(e.date) : new Date();
      const cy = created.getFullYear();
      const cm = created.getMonth() + 1;

      const type = e.recurrence_type || (e.fixed ? "fixed" : "once");
      const months = Number(e.months_duration || 0);

      if (type === "once") {
        addToMonth(cy, cm, e.amount);
      } else if (type === "fixed") {
        for (let m = 1; m <= 12; m++) {
          if (year > cy || (year === cy && m >= cm)) addToMonth(year, m, e.amount);
        }
      } else if (type === "months") {
        const n = Math.max(1, months);
        for (let i = 0; i < n; i++) {
          const d = new Date(created);
          d.setMonth(d.getMonth() + i);
          addToMonth(d.getFullYear(), d.getMonth() + 1, e.amount);
        }
      }
    }

    res.json({ year, totals });
  });
});

module.exports = router;
