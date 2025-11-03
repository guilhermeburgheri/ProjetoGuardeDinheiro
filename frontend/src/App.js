import { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  if (!user) {
    return page === "login" ? (
      <Login setUser={setUser} setPage={setPage} />
    ) : (
      <Register setPage={setPage} />
    );
  }

  if (page === "manageUsers") {
    return <ManageUsers user={user} setPage={setPage} />;
  }

  return <Dashboard user={user} setUser={setUser} setPage={setPage} />;
}
