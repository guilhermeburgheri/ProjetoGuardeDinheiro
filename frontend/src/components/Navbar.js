import { AppBar, Toolbar, Typography, Box, Button, IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

export default function Navbar({ user, onLogout, onGo, isAdmin, mode, onToggleTheme }) {
  return (
    <AppBar position="sticky" elevation={1} color="inherit" sx={{ borderBottom: "1px solid #eee" }}>
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
          💸 GuardeDinheiro
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button onClick={() => onGo("dashboard")} variant="text">Dashboard</Button>
          <Button onClick={() => onGo("compare")} variant="text">Comparar meses</Button>
          {isAdmin && <Button onClick={() => onGo("manageUsers")} variant="text">Gerenciar</Button>}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={mode === "dark" ? "Modo claro" : "Modo escuro"}>
            <IconButton onClick={onToggleTheme} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          <Typography variant="body2" color="text.secondary">@{user?.username}</Typography>
          <Button variant="contained" color="primary" onClick={onLogout}>Sair</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
