import { useEffect, useState } from "react";
import { getMonthlyExpenses } from "../api";

export default function CompareMonths({ user, setPage }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);

  useEffect(() => {
    getMonthlyExpenses(user.id, year).then(setData);
  }, [user, year]);

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const totalAnual = data?.totals?.reduce((s, x) => s + x.total, 0) ?? 0;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", fontFamily: "Arial" }}>
      <button onClick={() => setPage("dashboard")}>← Voltar</button>
      <h2>🗓️ Comparar meses</h2>

      <label>
        Ano:&nbsp;
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          style={{ width: 100 }}
        />
      </label>

      {!data ? (
        <p>Carregando…</p>
      ) : (
        <>
          <table
            style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}
          >
            <thead>
              <tr>
                {meses.map((m) => (
                  <th key={m} style={{ borderBottom: "1px solid #ccc", textAlign: "right", padding: 8 }}>
                    {m}
                  </th>
                ))}
                <th style={{ borderBottom: "1px solid #ccc", textAlign: "right", padding: 8 }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {data.totals.map((t) => (
                  <td key={t.month} style={{ textAlign: "right", padding: 8 }}>
                    R${t.total.toFixed(2)}
                  </td>
                ))}
                <td style={{ textAlign: "right", padding: 8, fontWeight: "bold" }}>
                  R${totalAnual.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: 20 }}>
            {data.totals.map((t, idx) => {
              const max = Math.max(...data.totals.map(x => x.total), 1);
              const pct = Math.round((t.total / max) * 100);
              return (
                <div key={idx} style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ width: 40 }}>{meses[idx]}</div>
                  <div style={{ flex: 1, background: "#eee", height: 10, margin: "0 8px" }}>
                    <div style={{ width: `${pct}%`, height: 10, background: "#999" }} />
                  </div>
                  <div style={{ width: 100, textAlign: "right" }}>R${t.total.toFixed(2)}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
