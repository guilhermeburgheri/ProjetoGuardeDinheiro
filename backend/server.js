const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const savingRoutes = require("./routes/savingRoutes");

const app = express();
app.use(bodyParser.json());

// cria tabelas se não existirem
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      description TEXT,
      amount REAL,
      fixed INTEGER DEFAULT 0,
      date TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS saving_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      goal_percentage REAL,
      salary REAL,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

// rotas
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/savings", savingRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
