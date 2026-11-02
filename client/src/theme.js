import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#203a34', dark: '#162c27', light: '#e4ece6', contrastText: '#fff' },
    secondary: { main: '#c3ef83', contrastText: '#1d3429' },
    background: { default: '#f5f6f2', paper: '#fff' },
    text: { primary: '#1b2421', secondary: '#68736e' },
    divider: '#e5e9e3',
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.065em' },
    h2: { fontWeight: 700, letterSpacing: '-0.045em' },
    h3: { fontWeight: 700, letterSpacing: '-0.035em' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: { styleOverrides: { root: { borderRadius: 999, padding: '11px 19px', boxShadow: 'none' } } },
    MuiCard: { styleOverrides: { root: { borderRadius: 18, boxShadow: 'none' } } },
  },
});
