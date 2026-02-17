import { useState, useEffect } from "react";
import { getUsers, deleteUser } from "../api";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Box,
  Chip,
  CircularProgress,
  Stack,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/Navbar";
import { useSnackbar } from "notistack";

export default function ManageUsers({ user, setPage, setUser, mode, toggleMode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (user.username !== "admin") return;

    async function load() {
      setLoading(true);
      const data = await getUsers(user.username);
      if (data?.error) {
        enqueueSnackbar(data.error, { variant: "error" });
      } else {
        setUsers(data || []);
      }
      setLoading(false);
    }

    load();
  }, [user, enqueueSnackbar]);

  async function handleDelete(id, usernameToDelete) {
    if (usernameToDelete === "admin") {
      enqueueSnackbar("Não é possível excluir o usuário admin.", {
        variant: "warning",
      });
      return;
    }

    if (
      usernameToDelete === user.username &&
      !window.confirm(
        "Você está tentando excluir o usuário logado. Tem certeza?"
      )
    ) {
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;

    setDeletingId(id);
    const res = await deleteUser(user.username, id);
    setDeletingId(null);

    if (res?.error) {
      enqueueSnackbar(res.error, { variant: "error" });
      return;
    }

    enqueueSnackbar(res?.message || "Usuário excluído com sucesso!", {
      variant: "success",
    });

    const updated = await getUsers(user.username);
    setUsers(updated || []);
  }

  if (user.username !== "admin") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f7",
        }}
      >
        <Typography variant="h6" color="error">
          Acesso restrito ao administrador.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Navbar
        user={user}
        onLogout={() => setUser(null)}
        onGo={setPage}
        isAdmin={true}
        mode={mode}
        onToggleTheme={toggleMode}
      />

      <Container maxWidth="md" sx={{ py: 3 }}>
        <Card elevation={0} sx={{ border: "1px solid #eee" }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  🧑‍💼 Gerenciar Usuários
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Exclua usuários criados no sistema. O usuário{" "}
                  <b>admin</b> não pode ser removido.
                </Typography>
              </Box>
              <Chip
                label={`${users.length} usuário(s)`}
                color="primary"
                variant="outlined"
              />
            </Stack>

            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : users.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ py: 4 }}
                >
                  Nenhum usuário para listar.
                </Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Usuário</TableCell>
                      <TableCell align="center">Tipo</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>{u.username}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={u.username === "admin" ? "Admin" : "Padrão"}
                            color={u.username === "admin" ? "secondary" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={() => handleDelete(u.id, u.username)}
                            disabled={deletingId === u.id}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </>
  );
}