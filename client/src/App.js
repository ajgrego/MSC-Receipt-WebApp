import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CashDonation from './pages/CashDonation';
import InKindDonation from './pages/InKindDonation';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#F052A1',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cash-donation" element={<CashDonation />} />
            <Route path="/in-kind-donation" element={<InKindDonation />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App; 