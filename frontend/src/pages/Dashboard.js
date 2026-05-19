import { useState, useEffect } from "react";
import { getExpenses, addExpense, deleteExpense, getSavings, setSavings, getMonthlyExpenses } from "../api";
import { Container, Grid, Card, CardContent, Typography, Button, Chip, IconButton, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Stack } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import SavingsIcon from "@mui/icons-material/Savings";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";
import SetSavingsDialog from "../components/SetSavingsDialog";
import AddExpenseDialog from "../components/AddExpenseDialog";
import { useSnackbar } from "notistack";

const recurrenceLabel = (e) => {
  if (e.kind === "income") return "Receita";
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

export default function Dashboard({ user, setUser, setPage, mode, toggleMode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [expenses, setExpenses] = useState([]);
  const [savings, setSavingsData] = useState(null);
  const [openSavings, setOpenSavings] = useState(false);
  const [openExpense, setOpenExpense] = useState(false);
  const [movementKind, setMovementKind] = useState("expense");
  const [monthSummary, setMonthSummary] = useState({ total: 0, expenses: 0, incomes: 0 });

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
      const month = r?.totals?.[monthIndex] ?? { total: 0, expenses: 0, incomes: 0 };
      setMonthSummary(month);
    });
  }, [user, expenses.length]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const expensesThisMonth = expenses
    .filter((e) => isExpenseActiveInMonth(e, currentYear, currentMonth))
    .sort((a, b) => {
      if (a.kind === "income" && b.kind !== "income") return -1;
      if (a.kind !== "income" && b.kind === "income") return 1;

      const typeA = a.recurrence_type || (a.fixed ? "fixed" : "once");
      const typeB = b.recurrence_type || (b.fixed ? "fixed" : "once");
      const rank = { once: 0, months: 1, fixed: 2 };
      const diff = (rank[typeA] ?? 0) - (rank[typeB] ?? 0);
      if (diff !== 0) return diff;
      if (typeA === "months" && typeB === "months") return Number(a.amount || 0) - Number(b.amount || 0);
      return String(a.description || "").localeCompare(String(b.description || ""), "pt-BR");
    });

  const salario = Number(savings?.salary || 0);
  const percentualGuardar = Number(savings?.goal_percentage || 0);
  const valorGuardar = (salario * percentualGuardar) / 100;
  const monthTotal = Number(monthSummary.total || 0);
  const receitasMes = Number(monthSummary.incomes || 0);
  const gastosBrutosMes = Number(monthSummary.expenses || 0);
  const sobraAposGastos = salario + monthTotal - valorGuardar;

  const handleSaveSavings = async ({ salary, goal }) => {
    await setSavings(user.id, goal, salary);
    const updated = await getSavings(user.id);
    setSavingsData(updated);
    enqueueSnackbar("Meta atualizada!", { variant: "success" });
    setOpenSavings(false);
  };

  const handleAddExpense = async (payload) => {
    await addExpense(user.id, payload.description, payload.amount, payload.fixed, payload.recurrence_type, payload.months_duration, payload.date, payload.kind);
    const updated = await getExpenses(user.id);
    setExpenses(updated);
    enqueueSnackbar(payload.kind === "income" ? "Receita adicionada!" : "Gasto adicionado!", { variant: "success" });
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
        mode={mode}
        onToggleTheme={toggleMode}
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
                <Typography variant="h6">Resultado do mês</Typography>
                <Typography variant="h5">{brl(monthTotal)}</Typography>
                <div style={{ marginTop: 8 }}>
                  <Typography color="text.secondary">
                    Gastos: R$ {gastosBrutosMes.toFixed(2).replace(".", ",")}
                  </Typography>

                  <Typography color="text.secondary">
                    Receitas: R$ {receitasMes.toFixed(2).replace(".", ",")}
                  </Typography>
                </div>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 2 }}>
                  <Button startIcon={<AddIcon />} variant="contained" onClick={() => { setMovementKind("expense"); setOpenExpense(true); }}>
                    Adicionar gasto
                  </Button>
                  <Button startIcon={<AddIcon />} variant="outlined" onClick={() => { setMovementKind("income"); setOpenExpense(true); }}>
                    Adicionar receita
                  </Button>
                </Stack>
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
                  <Typography variant="h6">Movimentações</Typography>
                  <Chip label={`${expensesThisMonth.length} item(ns)`} />
                </Stack>

                <TableContainer sx={{ mt: 1, overflowX: "auto" }}>
                  <Table sx={{ minWidth: 760, tableLayout: "fixed" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: "32%" }}>Descrição</TableCell>
                        <TableCell align="center" sx={{ width: 90 }}>Tipo</TableCell>
                        <TableCell align="right" sx={{ width: 120 }}>Valor</TableCell>
                        <TableCell align="center" sx={{ width: 170 }}>Recorrência</TableCell>
                        <TableCell align="center" sx={{ width: 80 }}>Meses</TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            width: 80,
                            position: "sticky",
                            right: 0,
                            bgcolor: "background.paper",
                            zIndex: 1,
                          }}
                        >
                          Ações
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expensesThisMonth.map((e) => (
                        <TableRow key={e.id} hover>
                          <TableCell
                            sx={{
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                              wordBreak: "break-word",
                            }}
                          >
                            {e.description}
                          </TableCell>
                          <TableCell align="center">
                            <Chip size="small" label={e.kind === "income" ? "Receita" : "Gasto"} color={e.kind === "income" ? "success" : "default"} variant="outlined" />
                          </TableCell>
                          <TableCell align="right" sx={{ color: e.kind === "income" ? "success.main" : "text.primary" }}>
                            {e.kind === "income" ? "+" : ""}{brl(e.amount)}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={recurrenceLabel(e)}
                              color={
                                e.kind === "income"
                                  ? "success"
                                  : (e.recurrence_type === "fixed" || e.fixed)
                                    ? "primary"
                                    : (e.recurrence_type === "months"
                                      ? "secondary"
                                      : "default")
                              }
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">{e.kind === "income" ? "-" : (e.months_duration ?? "-")}</TableCell>
                          <TableCell
                            align="center"
                            sx={{
                              position: "sticky",
                              right: 0,
                              bgcolor: "background.paper",
                              zIndex: 1,
                            }}
                          >
                            <IconButton aria-label="Excluir movimentação" onClick={() => removeExpense(e.id)}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                      {expensesThisMonth.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" style={{ color: "#888" }}>
                            Nenhuma movimentação cadastrada.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
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
        kind={movementKind}
      />
    </>
  );
}
