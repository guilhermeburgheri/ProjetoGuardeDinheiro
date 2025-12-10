import { useState, useEffect, useMemo } from "react";
import { getExpenses, addExpense, deleteExpense, getSavings, setSavings } from "../api";
import { Container, Grid, Card, CardContent, Typography, Button, Chip, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SavingsIcon from "@mui/icons-material/Savings";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";
import SetSavingsDialog from "../components/SetSavingsDialog";
import AddExpenseDialog from "../components/AddExpenseDialog";
import { useSnackbar } from "notistack";

const recurrenceLabel = (e) => {
  const type = e.recurrence_type || (e.fixed ? "fixed" : "once");
  if (type === "fixed") return "Todo mês";
  if (type === "months") return "Parcelado";
  return "Somente esse mês";
};

const brl = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

export default function Dashboard({ user, setUser, setPage }) {
  const { enqueueSnackbar } = useSnackbar();
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavingsData] = useState(null);
  const [openSavings, setOpenSavings] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);

  useEffect(() => {
    getExpenses(user.id).then(setExpenses);
    getSavings(user.id).then(setSavingsData);
  }, [user]);

  const totalGastos = useMemo(() => expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0), [expenses]);
  const salario = Number(savings?.salary || 0);
  const percentualGuardar = Number(savings?.goal_percentage || 0);
  const valorGuardar = (salario * percentualGuardar) / 100;
  const sobraAposGastos = salario - totalGastos - valorGuardar;

  const handleSaveSavings = async ({ salary, goal }) => {
    await setSavings(user.id, goal, salary);
    const updated = await getSavings(user.id);
    setSavingsData(updated);
    enqueueSnackbar("Meta atualizada!", { variant: "success" });
    setOpenSavings(false);
  };

  const handleAddExpense = async (payload) => {
    await addExpense(user.id, payload.description, payload.amount, payload.fixed, payload.recurrence_type, payload.months_duration);
    const updated = await getExpenses(user.id);
    setExpenses(updated);
    enqueueSnackbar("Gasto adicionado!", { variant: "success" });
    setOpenExpense(false);
  };

  const removeExpense = async (id) => {
    await deleteExpense(id);
    const updated = await getExpenses(user.id);
    setExpenses(updated);
    enqueueSnackbar("Gasto excluído.", { variant: "info" });
  };

  return (
    <>
      <Navbar
        user={user}
        onLogout={() => setUser(null)}
        onGo={setPage}
        isAdmin={user.username === "admin"}
      />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Meta</Typography>
                  <Button size="small" startIcon={<SavingsIcon />} variant="contained" onClick={() => setOpenSavings(true)}>Definir</Button>
                </Stack>
                <Typography mt={2} color="text.secondary">Salário</Typography>
                <Typography variant="h5">{brl(salario)}</Typography>
                <Typography mt={1} color="text.secondary">% Guardar</Typography>
                <Typography variant="h5">{percentualGuardar}%</Typography>
                <Chip sx={{ mt: 2 }} color="secondary" label={`Guardar ${brl(valorGuardar)}`} />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Typography variant="h6">Gastos do mês</Typography>
                <Typography variant="h5">{brl(salario)}</Typography>
                <Button sx={{ mt: 2 }} startIcon={<AddIcon />} variant="contained" onClick={() => setOpenExpense(true)}>
                  Adicionar gasto
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Typography variant="h6">Saldo</Typography>
                <Typography variant="h3" color={sobraAposGastos >= 0 ? "success.main" : "error.main"} sx={{ mt: 1 }}>
                  {brl(sobraAposGastos)}
                </Typography>
                <Typography color="text.secondary">Restante para se divertir com moderação</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Gastos</Typography>
                  <Chip label={`${expenses.length} item(ns)`} />
                </Stack>

                <Table sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Descrição</TableCell>
                      <TableCell align="right">Valor</TableCell>
                      <TableCell align="center">Recorrência</TableCell>
                      <TableCell align="center">Meses</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expenses.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell>{e.description}</TableCell>
                        <TableCell align="right">{brl(e.amount)}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={recurrenceLabel(e)}
                            color={
                              (e.recurrence_type === "fixed" || e.fixed)
                                ? "primary"
                                : (e.recurrence_type === "months"
                                  ? "secondary"
                                  : "default")
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">{e.months_duration ?? "-"}</TableCell>
                        <TableCell align="center">
                          <IconButton onClick={() => removeExpense(e.id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" style={{ color: "#888" }}>
                          Nenhum gasto cadastrado.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <SetSavingsDialog
        open={openSavings}
        onClose={() => setOpenSavings(false)}
        onSave={handleSaveSavings}
        initial={savings}
      />

      <AddExpenseDialog
        open={openExpense}
        onClose={() => setOpenExpense(false)}
        onSave={handleAddExpense}
      />
    </>
  );
}
