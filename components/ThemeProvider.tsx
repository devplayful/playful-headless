'use client';

import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

// Material Design 3 theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6750A4', // Material You purple
      light: '#9A82DB',
      dark: '#4F378B',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#625B71',
      light: '#8B83A1',
      dark: '#463D52',
      contrastText: '#FFFFFF',
    },
    tertiary: {
      main: '#7D5260',
      light: '#A87C89',
      dark: '#633B48',
      contrastText: '#FFFFFF',
    },
    surface: {
      main: '#FEF7FF',
      light: '#FFFFFF',
      dark: '#E6E0E9',
    },
    background: {
      default: '#FEF7FF',
      paper: '#FFFFFF',
    },
    error: {
      main: '#BA1A1A',
      light: '#DE3730',
      dark: '#93000A',
      contrastText: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'var(--font-dm-sans), Roboto, Arial, sans-serif',
    h1: {
      fontFamily: 'var(--font-paytone-one)',
      fontSize: '3.5rem',
      fontWeight: 400,
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: 'var(--font-paytone-one)',
      fontSize: '2.5rem',
      fontWeight: 400,
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: 'var(--font-montserrat)',
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: 'var(--font-montserrat)',
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontFamily: 'var(--font-dm-sans)',
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: 'var(--font-dm-sans)',
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12, // Material Design 3 rounded corners
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 20,
          padding: '12px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

// Extend the theme to include custom colors
declare module '@mui/material/styles' {
  interface Palette {
    tertiary: Palette['primary'];
    surface: Palette['primary'];
  }

  interface PaletteOptions {
    tertiary?: PaletteOptions['primary'];
    surface?: PaletteOptions['primary'];
  }
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppRouterCacheProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </AppRouterCacheProvider>
  );
}
