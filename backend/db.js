const sqlite3 = require("sqlite3").verbose();
const path = require("path");

let dbPath;

try {
  const { app } = require("electron");
  dbPath = path.join(app.getPath("userData"), "financas.db");
} catch (e) {
  dbPath = path.join(__dirname, "financas.db");
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("Erro ao conectar no banco:", err);
  else console.log("Banco conectado com sucesso!");
});

module.exports = db;
