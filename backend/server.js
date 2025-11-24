const express = require("express");
const bodyParser = require("body-parser");
const db = require("./db");
const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const savingRoutes = require("./routes/savingRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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
  
  db.run(
    "ALTER TABLE expenses ADD COLUMN recurrence_type TEXT",
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.log("Erro ao adicionar recurrence_type:", err.message);
      }
    }
  );

  db.run(
    "ALTER TABLE expenses ADD COLUMN months_duration INTEGER",
    (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.log("Erro ao adicionar months_duration:", err.message);
      }
    }
  );
});

const bcrypt = require("bcryptjs");

db.get("SELECT * FROM users WHERE username = 'admin'", async (err, row) => {
  if (!row) {
    const hashed = await bcrypt.hash("admin123", 10);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", ["admin", hashed], (e2) => {
      if (e2) console.error("Erro ao criar admin:", e2);
      else console.log("✅ Usuário admin criado (senha: admin123)");
    });
  }
});


// rotas
app.use("/auth", authRoutes);
app.use("/expenses", expenseRoutes);
app.use("/savings", savingRoutes);
app.use("/reports", reportsRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
