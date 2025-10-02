import { useState } from "react";
import { register } from "../api";

export default function Register({ setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleRegister() {
    const res = await register(username, password);
    setMsg(res.message || res.error);
  }

  return (
    <div>
      <h2>Registrar</h2>
      <input placeholder="Usuário" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleRegister}>Registrar</button>
      <p>{msg}</p>
      <p onClick={() => setPage("login")}>Já tem conta? Login</p>
    </div>
  );
}
