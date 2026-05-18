const express = require("express");
const db = require("../db");
const router = express.Router();

router.get("/monthly-expenses", (req, res) => {
  const userId = Number(req.query.userId);
  const year = Number(req.query.year);

  if (!userId || !year) return res.status(400).json({ error: "userId e year são obrigatórios" });

  db.all("SELECT *, COALESCE(kind, 'expense') AS kind FROM expenses WHERE user_id = ?", [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const totals = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      expenses: 0,
      incomes: 0,
    }));

    const addToMonth = (y, m, value, kind) => {
      if (y !== year || m < 1 || m > 12) return;

      const month = totals[m - 1];
      const amount = Number(value || 0);

      if (kind === "income") {
        month.incomes += amount;
        month.total -= amount;
      } else {
        month.expenses += amount;
        month.total += amount;
      }
    };

    for (const e of rows) {
      const created = e.date ? new Date(e.date) : new Date();
      const cy = created.getFullYear();
      const cm = created.getMonth() + 1;
      const kind = e.kind === "income" ? "income" : "expense";

      if (kind === "income") {
        addToMonth(cy, cm, e.amount, kind);
        continue;
      }

      const type = e.recurrence_type || (e.fixed ? "fixed" : "once");

      if (type === "once") {
        addToMonth(cy, cm, e.amount, kind);
      } else if (type === "fixed") {
        for (let m = 1; m <= 12; m++) {
          if (year > cy || (year === cy && m >= cm)) addToMonth(year, m, e.amount, kind);
        }
      } else if (type === "months") {
        const n = Math.max(1, Number(e.months_duration || 1));

        const startYear = cy;
        const startMonth = cm;

        for (let i = 0; i < n; i++) {
          const monthIndex = (startMonth - 1) + i;
          const y = startYear + Math.floor(monthIndex / 12);
          const m = (monthIndex % 12) + 1;
          addToMonth(y, m, e.amount, kind);
        }
      }
    }

    res.json({ year, totals });
  });
});

module.exports = router;
