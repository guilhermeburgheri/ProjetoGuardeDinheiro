import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export default function AddExpenseDialog({ open, onClose, onSave, kind = "expense", initialMonth }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState("once");
  const [months, setMonths] = useState("");
  const [month, setMonth] = useState(initialMonth || currentMonthValue());

  const isIncome = kind === "income";
  const fixed = !isIncome && recurrence === "fixed";

  const dialogTitle = useMemo(() => isIncome ? "Nova receita" : "Novo gasto", [isIncome]);
  const actionLabel = useMemo(() => isIncome ? "Adicionar receita" : "Adicionar", [isIncome]);

  const resetForm = useCallback(() => {
    setDescription("");
    setAmount("");
    setRecurrence("once");
    setMonths("");
    setMonth(initialMonth || currentMonthValue());
  }, [initialMonth]);

  useEffect(() => {
    if (open) resetForm();
  }, [open, resetForm]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = () => {
    const safeAmount = Number(amount);
    if (!description.trim() || !safeAmount) return;

    onSave({
      description: description.trim(),
      amount: Math.abs(safeAmount),
      fixed,
      recurrence_type: isIncome ? "once" : recurrence,
      months_duration: !isIncome && recurrence === "months" ? Number(months || 1) : null,
      date: `${month}-15T12:00:00`,
      kind: isIncome ? "income" : "expense",
    });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Descrição" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth />
          <TextField label="Valor" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} fullWidth />
          <TextField
            label="Mês"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {!isIncome && (
            <>
              <ToggleButtonGroup value={recurrence} exclusive onChange={(_, val) => val && setRecurrence(val)}>
                <ToggleButton value="once">Somente este mês</ToggleButton>
                <ToggleButton value="fixed">Fixo (todo mês)</ToggleButton>
                <ToggleButton value="months">Por X meses</ToggleButton>
              </ToggleButtonGroup>

              {recurrence === "months" && (
                <TextField label="Quantidade de meses" type="number" value={months} onChange={(e) => setMonths(e.target.value)} fullWidth />
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>{actionLabel}</Button>
      </DialogActions>
    </Dialog>
  );
}
