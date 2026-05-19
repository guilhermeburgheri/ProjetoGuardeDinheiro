import { useCallback, useEffect, useState } from "react";
import { addExpense, getMonthlyExpenses } from "../api";
import { Container, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box, Stack, TextField, Divider, Button, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Navbar from "../components/Navbar";
import AddExpenseDialog from "../components/AddExpenseDialog";
import { useSnackbar } from "notistack";

export default function CompareMonths({ user, setPage, setUser, mode, toggleMode }) {
  const { enqueueSnackbar } = useSnackbar();
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [openExpense, setOpenExpense] = useState(false);

  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const brl = (v) =>
    Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const selectedMonthValue = `${year}-${String(selectedMonth).padStart(2, "0")}`;

  const loadData = useCallback(() => {
    setLoading(true);
    getMonthlyExpenses(user.id, year).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [user.id, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalAnual = data?.totals?.reduce((s, x) => s + x.total, 0) ?? 0;
  const totalDespesas = data?.totals?.reduce((s, x) => s + Number(x.expenses || 0), 0) ?? 0;
  const totalReceitas = data?.totals?.reduce((s, x) => s + Number(x.incomes || 0), 0) ?? 0;

  const handleAddExpense = async (payload) => {
    await addExpense(
      user.id,
      payload.description,
      payload.amount,
      payload.fixed,
      payload.recurrence_type,
      payload.months_duration,
      payload.date,
      "expense"
    );
    enqueueSnackbar(`Gasto adicionado em ${meses[selectedMonth - 1]}/${year}!`, { variant: "success" });
    setOpenExpense(false);
    loadData();
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
        <Card elevation={0} sx={{ border: 1, borderColor: "divider" }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography variant="h5" fontWeight={700}>
                📊 Comparativo de Gastos Mensais
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "stretch", sm: "center" }}>
                <TextField
                  label="Ano"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  sx={{ width: { xs: "100%", sm: 120 } }}
                  size="small"
                />

                <TextField
                  select
                  label="Mês"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  sx={{ width: { xs: "100%", sm: 130 } }}
                  size="small"
                >
                  {meses.map((m, idx) => (
                    <MenuItem key={m} value={idx + 1}>{m}</MenuItem>
                  ))}
                </TextField>

                <Button startIcon={<AddIcon />} variant="contained" onClick={() => setOpenExpense(true)}>
                  Adicionar despesa
                </Button>
              </Stack>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Tipo</TableCell>
                      {meses.map((m) => (
                        <TableCell
                          key={m}
                          align="center"
                          sx={{ fontWeight: 600 }}
                        >
                          {m}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell>Despesas</TableCell>
                      {data.totals.map((t) => (
                        <TableCell key={`expenses-${t.month}`} align="center">
                          {brl(t.expenses)}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {brl(totalDespesas)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell>Receitas</TableCell>
                      {data.totals.map((t) => (
                        <TableCell key={`incomes-${t.month}`} align="center" sx={{ color: "success.main" }}>
                          {brl(t.incomes)}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 600, color: "success.main" }}>
                        {brl(totalReceitas)}
                      </TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell sx={{ fontWeight: 600 }}>Resultado</TableCell>
                      {data.totals.map((t) => (
                        <TableCell
                          key={`total-${t.month}`}
                          align="center"
                          sx={{
                            fontWeight: 600,
                            color: t.total < 0 ? "error.main" : t.total > 0 ? "success.main" : "text.primary",
                          }}
                        >
                          {brl(t.total)}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        {brl(totalAnual)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>

                <Box sx={{ mt: 4 }}>
                  <Typography variant="subtitle1" mb={1}>
                    Distribuição por mês
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "stretch",
                      justifyContent: "space-between",
                      height: 260,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      p: 2,
                      border: 1,
                      borderColor: "divider",
                      position: "relative",
                    }}
                  >
                    {/* Linha do zero */}
                    <Box
                      sx={{
                        position: "absolute",
                        left: 16,
                        right: 16,
                        top: "50%",
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    />

                    {data.totals.map((t, idx) => {
                      const max = Math.max(
                        ...data.totals.map((x) => Math.abs(Number(x.total || 0))),
                        1
                      );

                      const value = Number(t.total || 0);
                      const pct = Math.round((Math.abs(value) / max) * 100);

                      const isPositive = value > 0;
                      const isNegative = value < 0;

                      return (
                        <Box
                          key={idx}
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            mx: 0.5,
                            height: "100%",
                            zIndex: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ mb: 0.5, whiteSpace: "nowrap" }}
                          >
                            {brl(value)}
                          </Typography>

                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                            }}
                          >
                            {/* Área acima do zero */}
                            <Box
                              sx={{
                                height: "50%",
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "center",
                              }}
                            >
                              {isPositive && (
                                <Box
                                  sx={{
                                    width: "60%",
                                    height: `${pct}%`,
                                    minHeight: 6,
                                    bgcolor: "success.main",
                                    borderRadius: "999px 999px 0 0",
                                    transition: "height 0.3s",
                                  }}
                                />
                              )}
                            </Box>

                            {/* Área abaixo do zero */}
                            <Box
                              sx={{
                                height: "50%",
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "center",
                              }}
                            >
                              {isNegative && (
                                <Box
                                  sx={{
                                    width: "60%",
                                    height: `${pct}%`,
                                    minHeight: 6,
                                    bgcolor: "error.main",
                                    borderRadius: "0 0 999px 999px",
                                    transition: "height 0.3s",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>

                          <Typography
                            variant="caption"
                            sx={{ mt: 0.5, fontWeight: 500 }}
                          >
                            {meses[idx]}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      <AddExpenseDialog
        open={openExpense}
        onClose={() => setOpenExpense(false)}
        onSave={handleAddExpense}
        kind="expense"
        initialMonth={selectedMonthValue}
      />
    </>
  );
}
