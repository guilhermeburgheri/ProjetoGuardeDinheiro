import { useState } from "react";
import { register } from "../api";

export default function Register({ setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister() {
    if (!username || !password) {
      setMsg("Usuário e senha são obrigatórios.");
      return;
    }
    const res = await register(username, password);
    setMsg(res.message || res.error);
  }

  function handleKeyPress(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleRegister();
    }
  }

  return (
    <div>
      <h2>Registrar</h2>
      <input placeholder="Usuário" onChange={e => setUsername(e.target.value)} onKeyDown={handleKeyPress} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyPress} />
      <button onClick={handleRegister}>Registrar</button>
      {msg && ( <p style={{color: msg.startsWith("Usuário") ? "red" : "green" }}>{msg}</p>)}
      <p onClick={() => setPage("login")}>Já tem conta? Login</p>
    </div>
  );
}
