import { useState, useMemo, useEffect } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ManageUsers from "./pages/ManageUsers";
import CompareMonths from "./pages/CompareMonths";
import Investments from "./pages/Investments";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login");

  const [mode, setMode] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("themeMode");
    if (saved) setMode(saved);
  }, []);

  const toggleMode = () => {
    setMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", next);
      return next;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark" && {
            background: {
              default: "#121212",
              paper: "#1e1e1e",
            },
          }),
        },
      }),
    [mode]
  );

  let content;

  if (!user) {
    content =
      page === "login" ? (
        <Login setUser={setUser}
          setPage={setPage}
          mode={mode}
          toggleMode={toggleMode}
        />
      ) : (
        <Register
          setPage={setPage}
          mode={mode}
          toggleMode={toggleMode}
        />
      );
  } else if (page === "dashboard") {
    content = (
      <Dashboard
        user={user}
        setUser={setUser}
        setPage={setPage}
        mode={mode}
        toggleMode={toggleMode}
      />
    );
  } else if (page === "compare") {
    content = (
      <CompareMonths
        user={user}
        setPage={setPage}
        setUser={setUser}
        mode={mode}
        toggleMode={toggleMode}
      />
    );
  } else if (page === "manageUsers") {
    content = (
      <ManageUsers
        user={user}
        setPage={setPage}
        setUser={setUser}
        mode={mode}
        toggleMode={toggleMode}
      />
    );
  } else if (page === "investments") {
    content = (
      <Investments
        user={user}
        setUser={setUser}
        setPage={setPage}
        mode={mode}
        toggleMode={toggleMode}
      />
    );
  } else {
    content = (
      <Dashboard
        user={user}
        setUser={setUser}
        setPage={setPage}
        mode={mode}
        toggleMode={toggleMode}
      />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {content}
    </ThemeProvider>
  );
}
