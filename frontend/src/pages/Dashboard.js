import { useState, useEffect } from "react";
import { getExpenses, addExpense, deleteExpense, getSavings, setSavings } from "../api";

export default function Dashboard({ user, setUser, setPage }) {
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavingsData] = useState(null);

  useEffect(() => {
    getExpenses(user.id).then(setExpenses);
    getSavings(user.id).then(setSavingsData);
  }, [user]);

  async function handleAddExpense() {
    const desc = prompt("Descrição:");
    if (!desc) return;
    const amount = parseFloat(prompt("Valor:"));
    if (isNaN(amount)) return;

    const recurrence = prompt(
      "Tipo de gasto:\n1 - Só neste mês\n2 - Fixo todo mês\n3 - Por X meses"
    );

    let recurrence_type = "once";
    let months_duration = null;

    if (recurrence === "2") {
      recurrence_type = "fixed";
    } else if (recurrence === "3") {
      recurrence_type = "months";
      const qtd = parseInt(prompt("Por quantos meses?"), 10);
      months_duration = isNaN(qtd) ? 1 : qtd;
    }

    const fixed = recurrence === "2";

    await addExpense(user.id, desc, amount, fixed, recurrence_type, months_duration);
    getExpenses(user.id).then(setExpenses);
  }

  async function handleSetSavings() {
    const salary = parseFloat(prompt("Salário:"));
    const goal = parseFloat(prompt("Porcentagem para guardar (%):"));
    await setSavings(user.id, goal, salary);
    getSavings(user.id).then(setSavingsData);
  }

  const totalGastos = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const salario = savings?.salary || 0;
  const percentualGuardar = savings?.goal_percentage || 0;
  const valorGuardar = (salario * percentualGuardar) / 100;
  const sobraAposGastos = salario - totalGastos - valorGuardar;

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", fontFamily: "Arial" }}>
      <h2>Bem-vindo, {user.username}!</h2>
      <button onClick={() => setUser(null)}>Sair</button>
      {user.username === "admin" && (
        <button onClick={() => setPage("manageUsers")}>
          Gerenciar usuários
        </button>
      )}
      <hr />
      <h3>Meta de Poupança</h3>
      <button onClick={handleSetSavings}>Definir / Atualizar meta</button>
      {savings && (
        <p>
          Salário: <b>R${salario.toFixed(2)}</b> <br />
          Guardar: <b>{percentualGuardar}%</b> → <b>R${valorGuardar.toFixed(2)}</b>
        </p>
      )}

      <hr />
      <h3>Gastos</h3>
      <button onClick={handleAddExpense}>Adicionar gasto</button>
      <ul>
        {expenses.map((e) => {
          let label = `${e.description} - R$${e.amount}`;

          if (e.recurrence_type === "months" && e.months_duration) {
            label += ` (${e.months_duration}x)`;
          } else if (e.recurrence_type === "fixed") {
            label += " (fixo)";
          }

          return (
            <li key={e.id}>
              {label}
              <button
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  await deleteExpense(e.id);
                  getExpenses(user.id).then(setExpenses);
                }}
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>

      <p><b>Total de gastos:</b> R${totalGastos.toFixed(2)}</p>

      <hr />
      <h3>Resultado Final</h3>
      {savings ? (
        <div>
          <p><b>Guardar:</b> R${valorGuardar.toFixed(2)}</p>
          <p><b>Gastos:</b> R${totalGastos.toFixed(2)}</p>
          <p>
            <b>Restante para gastar (com moderação):</b>{" "}
            <span style={{ color: sobraAposGastos >= 0 ? "green" : "red" }}>
              R${sobraAposGastos.toFixed(2)}
            </span>
          </p>
        </div>
      ) : (
        <p>Defina sua meta de poupança para ver os resultados.</p>
      )}
    </div>
  );
}
