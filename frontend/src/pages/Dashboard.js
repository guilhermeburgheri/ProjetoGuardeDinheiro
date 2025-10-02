import { useState, useEffect } from "react";
import { getExpenses, addExpense, getSavings, setSavings } from "../api";

export default function Dashboard({ user, setUser }) {
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavingsData] = useState(null);

  useEffect(() => {
    getExpenses(user.id).then(setExpenses);
    getSavings(user.id).then(setSavingsData);
  }, [user]);

  async function handleAddExpense() {
    const desc = prompt("Descrição:");
    const amount = parseFloat(prompt("Valor:"));
    const fixed = window.confirm("É gasto fixo?");
    await addExpense(user.id, desc, amount, fixed);
    getExpenses(user.id).then(setExpenses);
  }

  async function handleSetSavings() {
    const salary = parseFloat(prompt("Salário:"));
    const goal = parseFloat(prompt("Porcentagem para guardar:"));
    await setSavings(user.id, goal, salary);
    getSavings(user.id).then(setSavingsData);
  }

  return (
    <div>
      <h2>Bem-vindo, {user.username}!</h2>
      <button onClick={() => setUser(null)}>Sair</button>

      <h3>Gastos</h3>
      <button onClick={handleAddExpense}>Adicionar gasto</button>
      <ul>
        {expenses.map(e => (
          <li key={e.id}>{e.description} - R${e.amount} {e.fixed ? "(fixo)" : ""}</li>
        ))}
      </ul>

      <h3>Meta de Poupança</h3>
      <button onClick={handleSetSavings}>Definir meta</button>
      {savings && (
        <p>
          Salário: R${savings.salary} | Guardar: {savings.goal_percentage}%
        </p>
      )}
    </div>
  );
}
