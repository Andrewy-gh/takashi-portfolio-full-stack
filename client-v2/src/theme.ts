import { createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Theme {
    breakpoints: {
      down(arg0: string): string | ((theme: Theme) => string);
      values: {
        mobile: number;
        tablet: number;
        laptop: number;
        desktop: number;
        wideScreen: number;
      };
    };
  }
  interface ThemeOptions {
    breakpoints: {
      values: {
        mobile: number;
        tablet: number;
        laptop: number;
        desktop: number;
        wideScreen: number;
      };
    };
  }

  interface Palette {
    custom: {
      light: string;
      main: string;
      dark: string;
      extraDark: string;
    };
  }
  interface PaletteOptions {
    custom: {
      light: string;
      main: string;
      dark: string;
      extraDark: string;
    };
  }
  interface BreakpointOverrides {
    // Your custom breakpoints
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
    wideScreen: true;
    // Remove default breakpoints
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
  }
  interface Breakpoints {
    values: {
      mobile: number;
      tablet: number;
      laptop: number;
      desktop: number;
      wideScreen: number;
    };
  }
}

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#1f1f1f',
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
          color: '#f1eeeb',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1f1f1f',
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
          backgroundColor: '#1f1f1f',
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
          backgroundColor: '#1f1f1f',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#665c4e',
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
