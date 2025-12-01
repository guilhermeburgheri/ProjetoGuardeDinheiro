import { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  Link,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { register } from "../api";

export default function Register({ setPage }) {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!username || !password) {
      enqueueSnackbar("Preencha usuário e senha.", { variant: "warning" });
      return;
    }
    if (password !== confirm) {
      enqueueSnackbar("As senhas não conferem.", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await register(username, password);
      if (res?.error) {
        enqueueSnackbar(res.error, { variant: "error" });
      } else {
        enqueueSnackbar("Usuário criado com sucesso!", { variant: "success" });
        setPage("login");
      }
    } catch (err) {
      enqueueSnackbar("Erro ao conectar com o servidor.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f7",
        p: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          Criar conta
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Cadastre um usuário para começar a organizar suas finanças.
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Usuário"
              fullWidth
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              label="Senha"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              label="Confirmar senha"
              type="password"
              fullWidth
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar"}
            </Button>
          </Stack>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Já tem conta?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setPage("login")}
            >
              Fazer login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}