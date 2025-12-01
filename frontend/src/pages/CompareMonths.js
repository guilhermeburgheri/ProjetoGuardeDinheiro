import { useEffect, useState } from "react";
import { getMonthlyExpenses } from "../api";
import {
  Container, Card, CardContent, Typography, Table, TableHead, TableRow,
  TableCell, TableBody, CircularProgress, Box, Stack, TextField, Divider
} from "@mui/material";
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
                  {data.totals.map((t, idx) => {
                    const max = Math.max(...data.totals.map((x) => x.total), 1);
                    const pct = Math.round((t.total / max) * 100);
                    return (
                      <Stack
                        key={idx}
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{ mb: 1 }}
                      >
                        <Typography sx={{ width: 40 }}>{meses[idx]}</Typography>
                        <Box
                          sx={{
                            flex: 1,
                            backgroundColor: "#eee",
                            borderRadius: 1,
                            height: 10,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${pct}%`,
                              backgroundColor: "primary.main",
                              borderRadius: 1,
                              height: "100%",
                            }}
                          />
                        </Box>
                        <Typography sx={{ width: 100, textAlign: "right" }}>
                          {brl(t.total)}
                        </Typography>
                      </Stack>
                    );
                  })}
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}