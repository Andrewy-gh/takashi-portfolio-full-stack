import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import { CssBaseline, ThemeProvider, responsiveFontSizes } from '@mui/material';
import { theme } from './theme';
import { CatchBoundary } from '@tanstack/react-router';
import './app.css';

// Set up a Router instance
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  defaultErrorComponent: (e) => {
    const errorMessage: String =
      'error' in e && e.error instanceof Error
        ? e.error.message
        : 'Oops an error happened';
    return (
      <CatchBoundary
        getResetKey={() => 'reset'}
        onCatch={(error) => console.error(error)}
      >
        <div>{errorMessage}</div>
      </CatchBoundary>
    );
  },
});

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <ThemeProvider theme={responsiveFontSizes(theme)}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
