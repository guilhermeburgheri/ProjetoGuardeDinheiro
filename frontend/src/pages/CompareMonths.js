import { useEffect, useState } from "react";
import { getMonthlyExpenses } from "../api";
import { Container, Card, CardContent, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Box, Stack, TextField, Divider } from "@mui/material";
import Navbar from "../components/Navbar";

export default function CompareMonths({ user, setPage, setUser }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const meses = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const brl = (v) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  useEffect(() => {
    setLoading(true);
    getMonthlyExpenses(user.id, year).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [user, year]);

  const totalAnual = data?.totals?.reduce((s, x) => s + x.total, 0) ?? 0;

  return (
    <>
      <Navbar
        user={user}
        onLogout={() => setUser(null)}
        onGo={setPage}
        isAdmin={user.username === "admin"}
      />

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Card elevation={0} sx={{ border: "1px solid #eee" }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Typography variant="h5" fontWeight={700}>
                📊 Comparativo de Gastos Mensais
              </Typography>

              <TextField
                label="Ano"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                sx={{ width: 120 }}
                size="small"
              />
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
                      {data.totals.map((t) => (
                        <TableCell key={t.month} align="center">
                          {brl(t.total)}
                        </TableCell>
                      ))}
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
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
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      height: 220,
                      borderRadius: 2,
                      bgcolor: "#fafafa",
                      p: 2,
                    }}
                  >
                    {data.totals.map((t, idx) => {
                      const max = Math.max(...data.totals.map((x) => x.total), 1);
                      const pct = Math.round((t.total / max) * 100);

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
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ mb: 0.5, whiteSpace: "nowrap" }}
                          >
                            {brl(t.total)}
                          </Typography>

                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              alignItems: "flex-end",
                              width: "100%",
                            }}
                          >
                            <Box
                              sx={{
                                width: "60%",
                                height: `${pct}%`,
                                minHeight: t.total > 0 ? 6 : 0,
                                bgcolor: "primary.main",
                                borderRadius: 999,
                                transition: "height 0.3s",
                              }}
                            />
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
    </>
  );
}