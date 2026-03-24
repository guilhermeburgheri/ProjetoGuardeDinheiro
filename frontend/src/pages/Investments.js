import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import Navbar from "../components/Navbar";

const brl = (v) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const STORAGE_KEY = "saved_investments";

const calculateSimulation = ({
  initialAmount = 0,
  monthlyContribution = 0,
  months = 0,
  monthlyRate = 0,
  withdrawalFee = 0,
}) => {
  const initial = Number(initialAmount || 0);
  const contribution = Number(monthlyContribution || 0);
  const totalMonths = Number(months || 0);
  const rate = Number(monthlyRate || 0) / 100;
  const withdrawal = Number(withdrawalFee || 0) / 100;

  let balance = initial;
  const rows = [];

  for (let month = 1; month <= totalMonths; month++) {
    const startBalance = balance;
    const profit = startBalance * rate;
    balance = startBalance + profit + contribution;

    rows.push({
      month,
      startBalance,
      contribution,
      profit,
      endBalance: balance,
    });
  }

  const grossFinalBalance = balance;
  const withdrawalDiscount = grossFinalBalance * withdrawal;
  const finalBalance = grossFinalBalance - withdrawalDiscount;

  const totalContributed = initial + contribution * totalMonths;
  const totalProfit = finalBalance - totalContributed;

  // Regra de exibição para não poluir a tabela
  const displayedRows = rows.filter(
    (row) => row.month === 1 || row.month % 3 === 0 || row.month === totalMonths
  );

  return {
    grossFinalBalance,
    withdrawalDiscount,
    finalBalance,
    totalContributed,
    totalProfit,
    rows: displayedRows,
  };
};

export default function Investments({
  user,
  setUser,
  setPage,
  mode,
  toggleMode,
}) {
  const [investmentName, setInvestmentName] = useState("");
  const [initialAmount, setInitialAmount] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [months, setMonths] = useState("12");
  const [monthlyRate, setMonthlyRate] = useState("1");
  const [withdrawalFee, setWithdrawalFee] = useState("");
  const [savedInvestments, setSavedInvestments] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      setSavedInvestments(JSON.parse(saved));
    } catch {
      setSavedInvestments([]);
    }
  }, []);

  const SaveInvestmentsList = (list) => {
    setSavedInvestments(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const simulation = useMemo(() => {
    return calculateSimulation({
      initialAmount,
      monthlyContribution,
      months,
      monthlyRate,
      withdrawalFee,
    });
  }, [initialAmount, monthlyContribution, months, monthlyRate, withdrawalFee]);

  const savedInvestmentsResults = useMemo(() => {
    return savedInvestments.map((investment) => ({
      ...investment,
      simulation: calculateSimulation(investment),
    }));
  }, [savedInvestments]);

  const allInvestments = useMemo(() => {
    return savedInvestmentsResults.reduce(
      (acc, item) => {
        acc.grossFinalBalance += item.simulation.grossFinalBalance;
        acc.withdrawalDiscount += item.simulation.withdrawalDiscount;
        acc.finalBalance += item.simulation.finalBalance;
        acc.totalContributed += item.simulation.totalContributed;
        acc.totalProfit += item.simulation.totalProfit;

        return acc;
      },
      {
        grossFinalBalance: 0,
        withdrawalDiscount: 0,
        finalBalance: 0,
        totalContributed: 0,
        totalProfit: 0,
      }
    );
  }, [savedInvestmentsResults]);

  const handleSaveInvestment = () => {
    const newInvestment = {
      id: Date.now(),
      investmentName:
        investmentName?.trim() || `Investimento ${savedInvestments.length + 1}`,
      initialAmount: Number(initialAmount || 0),
      monthlyContribution: Number(monthlyContribution || 0),
      months: Number(months || 0),
      monthlyRate: Number(monthlyRate || 0),
      withdrawalFee: withdrawalFee === "" ? "" : Number(withdrawalFee || 0),
    };

    const updatedList = [...savedInvestments, newInvestment];
    SaveInvestmentsList(updatedList);

    setInvestmentName("");
    setInitialAmount("");
    setMonthlyContribution("");
    setMonths("12");
    setMonthlyRate("1");
    setWithdrawalFee("");
  };

  const handleRemoveInvestment = (id) => {
    const updatedList = savedInvestments.filter((item) => item.id !== id);
    SaveInvestmentsList(updatedList);
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
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Grid item>
            <Card elevation={0} sx={{ border: "1px solid #eee", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Simulador de Investimentos
                </Typography>

                <Stack spacing={2} mt={2}>
                  <TextField
                    label="Nome do Investimento"
                    value={investmentName}
                    onChange={(e) => setInvestmentName(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Total investido inicial"
                    type="number"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Aporte mensal (opcional)"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Quantidade de meses"
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Rendimento por mês (%)"
                    type="number"
                    value={monthlyRate}
                    onChange={(e) => setMonthlyRate(e.target.value)}
                    fullWidth
                  />

                  <TextField
                    label="Taxa/Juros na retirada (%) - opcional"
                    type="number"
                    value={withdrawalFee}
                    onChange={(e) => setWithdrawalFee(e.target.value)}
                    fullWidth
                  />

                  <Button variant="contained" onClick={handleSaveInvestment}>
                    Salvar investimento
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item>
            <Card elevation={0} sx={{ border: "1px solid #eee", height: "100%" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resultado da Simulação
                </Typography>

                <Stack spacing={2} mt={2}>
                  <Chip
                    color="secondary"
                    label={`Total investido: ${brl(simulation.totalContributed)}`}
                  />
                  <Chip
                    color="success"
                    label={`Rendimentos líquidos: ${brl(simulation.totalProfit)}`}
                  />
                  <Chip
                    color="primary"
                    label={`Valor bruto final: ${brl(simulation.grossFinalBalance)}`}
                  />
                  <Chip
                    color="warning"
                    label={`Desconto na retirada: ${brl(
                      simulation.withdrawalDiscount
                    )}`}
                  />
                  <Chip
                    color="success"
                    label={`Valor líquido final: ${brl(simulation.finalBalance)}`}
                  />
                </Stack>

                {savedInvestmentsResults.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Valores dos investimentos salvos
                    </Typography>

                    <Stack spacing={2} mt={2}>
                      <Chip
                        color="secondary"
                        label={`Total investido: ${brl(
                          allInvestments.totalContributed
                        )}`}
                      />
                      <Chip
                        color="success"
                        label={`Rendimentos líquidos totais: ${brl(
                          allInvestments.totalProfit
                        )}`}
                      />
                      <Chip
                        color="primary"
                        label={`Valor bruto total: ${brl(
                          allInvestments.grossFinalBalance
                        )}`}
                      />
                      <Chip
                        color="warning"
                        label={`Desconto total na retirada: ${brl(
                          allInvestments.withdrawalDiscount
                        )}`}
                      />
                      <Chip
                        color="success"
                        label={`Valor líquido total: ${brl(
                          allInvestments.finalBalance
                        )}`}
                      />
                    </Stack>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Evolução do investimento atual
                </Typography>

                <Table sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mês</TableCell>
                      <TableCell align="right">Saldo inicial</TableCell>
                      <TableCell align="right">Aporte</TableCell>
                      <TableCell align="right">Rendimento</TableCell>
                      <TableCell align="right">Saldo final</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {simulation.rows.map((row) => (
                      <TableRow key={row.month} hover>
                        <TableCell>{row.month}</TableCell>
                        <TableCell align="right">{brl(row.startBalance)}</TableCell>
                        <TableCell align="right">{brl(row.contribution)}</TableCell>
                        <TableCell align="right">{brl(row.profit)}</TableCell>
                        <TableCell align="right">{brl(row.endBalance)}</TableCell>
                      </TableRow>
                    ))}

                    {simulation.rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          Nenhum resultado para exibir.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>

          <Grid item sx={{ gridColumn: { xs: "1", md: "1 / span 2" } }}>
            <Card elevation={0} sx={{ border: "1px solid #eee" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investimentos salvos
                </Typography>

                <Table sx={{ mt: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome do investimento</TableCell>
                      <TableCell align="right">Valor inicial</TableCell>
                      <TableCell align="right">Aporte mensal</TableCell>
                      <TableCell align="right">Meses</TableCell>
                      <TableCell align="right">Rendimento/mês</TableCell>
                      <TableCell align="right">Taxa na retirada</TableCell>
                      <TableCell align="right">Valor líquido final</TableCell>
                      <TableCell align="right">Rendimentos líquidos</TableCell>
                      <TableCell align="right">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {savedInvestmentsResults.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.investmentName}</TableCell>
                        <TableCell align="right">{brl(item.initialAmount)}</TableCell>
                        <TableCell align="right">
                          {brl(item.monthlyContribution)}
                        </TableCell>
                        <TableCell align="right">{item.months}</TableCell>
                        <TableCell align="right">{item.monthlyRate}%</TableCell>
                        <TableCell align="right">
                          {item.withdrawalFee === "" ? "Não informada" : `${item.withdrawalFee}%`}
                        </TableCell>
                        <TableCell align="right">
                          {brl(item.simulation.finalBalance)}
                        </TableCell>
                        <TableCell align="right">
                          {brl(item.simulation.totalProfit)}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            color="error"
                            size="small"
                            onClick={() => handleRemoveInvestment(item.id)}
                          >
                            Remover
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}

                    {savedInvestmentsResults.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          Nenhum investimento salvo.
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
    </>
  );
}