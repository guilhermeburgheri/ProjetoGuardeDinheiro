import { useState, useEffect } from "react";
import { getUsers, deleteUser } from "../api";

export default function ManageUsers({ user, setPage }) {
  const [users, setUsers] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getUsers(user.username);
      if (data?.error) setMsg(data.error);
      else setUsers(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  async function handleDelete(id, usernameToDelete) {
    if (usernameToDelete === user.username) {
      setMsg("Você não pode excluir o usuário atualmente logado.");
      return;
    }
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setDeletingId(id);
    const res = await deleteUser(user.username, id);
    setDeletingId(null);

    if (res?.error) setMsg(res.error);
    else {
      setMsg(res.message || "Usuário excluído com sucesso!");
      const updated = await getUsers(user.username);
      setUsers(updated || []);
    }
  }

  if (user.username !== "admin") {
    return <p style={{ color: "red" }}>Acesso restrito ao admin.</p>;
  }

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", fontFamily: "Arial" }}>
      <button onClick={() => setPage("dashboard")}>← Voltar</button>
      <h2>Gerenciar Usuários</h2>

      {msg && <p style={{ color: "blue" }}>{msg}</p>}
      {loading ? (
        <p>Carregando usuários…</p>
      ) : users.length === 0 ? (
        <p>Nenhum usuário para listar.</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id} style={{ marginBottom: 8 }}>
              {u.username}
              <button
                style={{ marginLeft: 10 }}
                onClick={() => handleDelete(u.id, u.username)}
                disabled={deletingId === u.id}
                title={u.username === "admin" ? "Não é possível excluir o admin" : ""}
              >
                {deletingId === u.id ? "Excluindo…" : "🗑️ Excluir"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}