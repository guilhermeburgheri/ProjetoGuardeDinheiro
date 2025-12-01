import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack } from "@mui/material";
import { useState, useEffect } from "react";

export default function SetSavingsDialog({ open, onClose, onSave, initial }) {
  const [salary, setSalary] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    setSalary(initial?.salary ?? "");
    setGoal(initial?.goal_percentage ?? "");
  }, [initial]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Definir meta de poupança</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Salário" type="number" value={salary} onChange={e => setSalary(e.target.value)} fullWidth />
          <TextField label="Porcentagem para guardar (%)" type="number" value={goal} onChange={e => setGoal(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={() => onSave({ salary: Number(salary), goal: Number(goal) })}>
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
