import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Frontpage } from './pages/frontpage';
import './app.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Frontpage />} />
          {/* Plan page route will be added in future implementation */}
          <Route path="/plan/:id" element={<div>Plan page coming soon...</div>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
