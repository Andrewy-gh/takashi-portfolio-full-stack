import { createTheme } from '@mui/material';

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#202020',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#b39984',
          '&:hover': {
            backgroundColor: '#665c4e',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#202020',
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: '#f1eeeb',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#f1eeeb',
          backgroundColor: '#202020',
        },
      },
    },
    // Textfield component outline
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#f1eeeb',
        },
      },
    },
    // Menu Item component
    MuiList: {
      styleOverrides: {
        root: {
          backgroundColor: '#202020',
        },
      },
    },
  },
  breakpoints: {
    values: {
      mobile: 0,
      tablet: 768,
      laptop: 1024,
      desktop: 1200,
      wideScreen: 1400,
    },
  },
  palette: {
    text: {
      primary: '#f1eeeb',
    },
    custom: {
      light: '#f1eeeb',
      main: '#b39984',
      dark: '#665c4e',
      extraDark: '#202020',
    },
  },
  spacing: 8,
  typography: {
    fontFamily: [
      'Judson',
      'Quando',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
  },
});
