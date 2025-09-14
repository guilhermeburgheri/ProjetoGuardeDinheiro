const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// BD SQLite
const db = new sqlite3.Database('./financas.db');

// Teste de rota
app.get('/api/teste', (req, res) => {
  res.json({ mensagem: 'API funcionando!' });
});

app.listen(3001, () => {
  console.log('Backend rodando em http://localhost:3001');
});
