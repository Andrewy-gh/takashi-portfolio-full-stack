import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      light: string;
      main: string;
      dark: string;
      extraDark: string;
    };
  }

  interface PaletteOptions {
    custom?: {
      light: string;
      main: string;
      dark: string;
      extraDark: string;
    };
  }

  interface BreakpointOverrides {
    xs: false;
    sm: false;
    md: false;
    lg: false;
    xl: false;
    mobile: true;
    tablet: true;
    laptop: true;
    desktop: true;
    wideScreen: true;
  }
}
