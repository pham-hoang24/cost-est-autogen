import React from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Paper
} from '@mui/material';
import { 
  Security as SecurityIcon,
  DataObject as DataIcon
} from '@mui/icons-material';
import DataAnonymizationDashboard from './components/DataAnonymizationDashboard';

// Create SW4E-consistent dark theme - EXACT SW4E Sandbox colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#22c55e',  // Exact SW4E bright green (from compliance bars)
      light: '#4ade80',
      dark: '#16a34a',
    },
    secondary: {
      main: '#a3e635',  // SW4E bright lime (for "Create New" buttons)
      light: '#bef264',
      dark: '#84cc16',
    },
    background: {
      default: '#0f172a',  // SW4E exact dark background
      paper: '#1e293b',    // SW4E exact card background
    },
    text: {
      primary: '#ffffff',    // Pure white text like SW4E
      secondary: '#e2e8f0',  // SW4E secondary text
    },
    divider: '#334155',      // SW4E border color
    success: {
      main: '#22c55e',     // Bright SW4E green
      light: '#4ade80',
      dark: '#16a34a',
    },
    warning: {
      main: '#f59e0b',     
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',     
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 700,
      color: '#f9fafb',
    },
    h5: {
      fontWeight: 600,
      color: '#f9fafb',
    },
    h6: {
      fontWeight: 600,
      color: '#f9fafb',
    },
    body1: {
      color: '#d1d5db',
    },
    body2: {
      color: '#9ca3af',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#0f172a',  // Exact SW4E background
          color: '#ffffff',            // Pure white text
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',  // Exact SW4E card background (same as Services page)
          backgroundImage: 'none',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: 8,
          border: '1px solid #334155',  // Exact SW4E border (same as Services page)
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',  // Exact SW4E header background
          backgroundImage: 'none',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderBottom: '1px solid #334155',  // Exact SW4E border
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
        contained: {
          backgroundColor: '#a3e635',  // Exact SW4E bright lime (same as Services page Launch buttons)
          color: '#0f172a',            // Dark text on bright background
          fontWeight: 600,
          '&:hover': {
            backgroundColor: '#84cc16',  // Darker lime on hover
          },
          '&.MuiButton-containedPrimary': {
            backgroundColor: '#22c55e',  // Exact SW4E bright green (same as Services page primary)
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#16a34a',
            },
          },
        },
        outlined: {
          borderColor: '#374151',
          color: '#d1d5db',
          '&:hover': {
            borderColor: '#22c55e',  // Exact SW4E bright green
            backgroundColor: 'rgba(34, 197, 94, 0.04)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#374151',
          color: '#f9fafb',
          '&.MuiChip-colorPrimary': {
            backgroundColor: 'rgba(34, 197, 94, 0.2)',  // Exact SW4E bright green
            color: '#4ade80',
            border: '1px solid #22c55e',
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: 'rgba(163, 230, 53, 0.2)',  // Exact SW4E bright lime (same as Services)
            color: '#bef264',
            border: '1px solid #a3e635',
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: 'rgba(34, 197, 94, 0.2)',  // Exact SW4E bright green
            color: '#4ade80',
            border: '1px solid #22c55e',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#22c55e',  // Exact SW4E bright green
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: '#9ca3af',
          '&.Mui-selected': {
            color: '#22c55e',  // Exact SW4E bright green for selected tab
          },
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          color: '#d1d5db',
          '&.Mui-active': {
            color: '#22c55e',  // Exact SW4E bright green for active step
          },
          '&.Mui-completed': {
            color: '#22c55e',  // Exact SW4E bright green for completed step
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#374151',
          '&.Mui-active': {
            color: '#22c55e',  // Exact SW4E bright green for active step icon
          },
          '&.Mui-completed': {
            color: '#22c55e',  // Exact SW4E bright green for completed step icon
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#1f2937',
          border: '1px solid #374151',
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          color: '#fca5a5',
          borderColor: '#ef4444',
        },
        standardWarning: {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: '#fcd34d',
          borderColor: '#f59e0b',
        },
        standardInfo: {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          color: '#93c5fd',
          borderColor: '#3b82f6',
        },
        standardSuccess: {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',  // Exact SW4E bright green
          color: '#4ade80',
          borderColor: '#22c55e',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#334155',  // Same as Services page border color for consistency
            color: '#ffffff',             // Pure white text (same as Services page)
            '& fieldset': {
              borderColor: '#475569',
            },
            '&:hover fieldset': {
              borderColor: '#22c55e',  // Exact SW4E bright green (same as Services page)
            },
            '&.Mui-focused fieldset': {
              borderColor: '#22c55e',  // Exact SW4E bright green (same as Services page)
            },
          },
          '& .MuiInputLabel-root': {
            color: '#9ca3af',
            '&.Mui-focused': {
              color: '#22c55e',  // Exact SW4E bright green for input label focus
            },
          },
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#22c55e',  // Exact SW4E bright green for loading spinner
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: 'background.default' }}>
        {/* Professional Header */}
        <AppBar position="static" elevation={0}>
          <Toolbar>
            <SecurityIcon sx={{ mr: 2, fontSize: 32 }} />
            <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
              GDPR-Compliant Data Anonymization Service
            </Typography>
            <DataIcon sx={{ fontSize: 28 }} />
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
              Professional Data Anonymization Platform
            </Typography>
            <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
              Secure • GDPR Compliant • Professional
            </Typography>
          </Paper>

          {/* Dashboard Component */}
          <DataAnonymizationDashboard />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
