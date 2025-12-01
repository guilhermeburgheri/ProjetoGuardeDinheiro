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
import { login } from "../api";

export default function Login({ setUser, setPage }) {
  const { enqueueSnackbar } = useSnackbar();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(username, password);
      if (res?.userId) {
        setUser({ id: res.userId, username });
        setPage("dashboard");
        enqueueSnackbar("Login realizado com sucesso!", { variant: "success" });
      } else {
        enqueueSnackbar(res?.error || "Usuário ou senha inválidos", {
          variant: "error",
        });
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
          💸 GuardeDinheiro
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Faça login para acessar seu controle financeiro.
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
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </Stack>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2">
            Não tem conta?{" "}
            <Link
              component="button"
              type="button"
              onClick={() => setPage("register")}
            >
              Registrar
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}