import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useState } from "react";

export default function AddExpenseDialog({ open, onClose, onSave }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState("once");
  const [months, setMonths] = useState("");

  const fixed = recurrence === "fixed";

  const handleSave = () => {
    onSave({
      description,
      amount: Number(amount),
      fixed,
      recurrence_type: recurrence,
      months_duration: recurrence === "months" ? Number(months || 1) : null
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Novo gasto</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Descrição" value={description} onChange={e => setDescription(e.target.value)} fullWidth />
          <TextField label="Valor" type="number" value={amount} onChange={e => setAmount(e.target.value)} fullWidth />
          <ToggleButtonGroup value={recurrence} exclusive onChange={(_, val) => val && setRecurrence(val)}>
            <ToggleButton value="once">Somente este mês</ToggleButton>
            <ToggleButton value="fixed">Fixo (todo mês)</ToggleButton>
            <ToggleButton value="months">Por X meses</ToggleButton>
          </ToggleButtonGroup>
          {recurrence === "months" && (
            <TextField label="Quantidade de meses" type="number" value={months} onChange={e => setMonths(e.target.value)} fullWidth />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>Adicionar</Button>
      </DialogActions>
    </Dialog>
  );
}
