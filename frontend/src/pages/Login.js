import { useState } from "react";
import { login } from "../api";

export default function Login({ setUser, setPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    const res = await login(username, password);
    if (res.userId) {
      setUser({ id: res.userId, username });
    } else {
      setError(res.error);
    }
  }

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Usuário" onChange={e => setUsername(e.target.value)} />
      <input type="password" placeholder="Senha" onChange={e => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Entrar</button>
      {error && <p style={{color:"red"}}>{error}</p>}
      <p onClick={() => setPage("register")}>Não tem conta? Registrar</p>
    </div>
  );
}
