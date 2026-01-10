import { useState, useEffect } from "react";
import { getExpenses, addExpense, deleteExpense, getSavings, setSavings, getMonthlyExpenses } from "../api";
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

const isExpenseActiveInMonth = (expense, year, month1to12) => {
  const type = expense.recurrence_type || (expense.fixed ? "fixed" : "once");
  const start = expense.date ? new Date(expense.date) : null;
  if (!start) return false;

  const startYear = start.getFullYear();
  const startMonth = start.getMonth() + 1;

  const startIndex = startYear * 12 + startMonth;
  const targetIndex = year * 12 + month1to12;

  if (type === "once") {
    return startYear === year && startMonth === month1to12;
  }

  if (type === "fixed") {
    return targetIndex >= startIndex;
  }

  if (type === "months") {
    const n = Math.max(1, Number(expense.months_duration || 1));
    return targetIndex >= startIndex && targetIndex < startIndex + n;
  }

  return false;
};

export default function Dashboard({ user, setUser, setPage }) {
  const { enqueueSnackbar } = useSnackbar();
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavingsData] = useState(null);
  const [openSavings, setOpenSavings] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [monthTotal, setMonthTotal] = useState(0);

  useEffect(() => {
    getExpenses(user.id).then(setExpenses);
    getSavings(user.id).then(setSavingsData);
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;
    const now = new Date();
    const year = now.getFullYear();
    const monthIndex = now.getMonth();

    getMonthlyExpenses(user.id, year).then((r) => {
      const total = r?.totals?.[monthIndex]?.total ?? 0;
      setMonthTotal(total);
    });
  }, [user, expenses.length]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const expensesThisMonth = expenses.filter((e) =>
    isExpenseActiveInMonth(e, currentYear, currentMonth)
  );

  const salario = Number(savings?.salary || 0);
  const percentualGuardar = Number(savings?.goal_percentage || 0);
  const valorGuardar = (salario * percentualGuardar) / 100;
  const sobraAposGastos = salario - monthTotal - valorGuardar;

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
        <Grid
          container
          spacing={2}
          sx={{
            display: "grid",
            gap: 2,
            gridAutoRows: "1fr",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 2fr" },
            gridTemplateAreas: {
              xs: `
        "meta"
        "gastosMes"
        "saldo"
        "tabela"
      `,
              md: `
        "meta      gastosMes  tabela"
        "saldo     saldo      tabela"
      `,
            },
            alignItems: "stretch",
          }}
        >
          <Grid item sx={{ gridArea: "meta" }}>
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

          <Grid item sx={{ gridArea: "gastosMes" }}>
            <Card elevation={0} sx={{ border: "1px solid #eee", height: "100%" }}>
              <CardContent>
                <Typography variant="h6">Gastos do mês</Typography>
                <Typography variant="h5">{brl(monthTotal)}</Typography>
                <Button sx={{ mt: 2 }} startIcon={<AddIcon />} variant="contained" onClick={() => setOpenExpense(true)}>
                  Adicionar gasto
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item sx={{ gridArea: "saldo" }}>
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

          <Grid item sx={{ gridArea: "tabela" }}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h6">Gastos</Typography>
                  <Chip label={`${expensesThisMonth.length} item(ns)`} />
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
                    {expensesThisMonth.map((e) => (
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
                    {expensesThisMonth.length === 0 && (
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
