import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";

export default function Navbar({ user, onLogout, onGo, isAdmin }) {
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
          <Typography variant="body2" color="text.secondary">@{user?.username}</Typography>
          <Button variant="contained" color="primary" onClick={onLogout}>Sair</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
