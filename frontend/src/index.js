import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";

const theme = createTheme({
  palette: {
    mode: "light", 
    primary: { main: "#7c3aed" },
    secondary: { main: "#00b894" },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 12 } } },
    MuiCard:   { styleOverrides: { root: { borderRadius: 16 } } },
  },
  typography: { fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial` }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <SnackbarProvider maxSnack={3} autoHideDuration={2500} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
      <App />
    </SnackbarProvider>
  </ThemeProvider>
);
