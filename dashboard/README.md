# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Env

- `VITE_API_BASE_URL` (optional): API base URL for the dashboard (defaults to same origin).

## E2E Env

Playwright e2e auth uses Better Auth session login through `/sign-in` (no `/api/auth/login` dependency).

- `E2E_ADMIN_EMAIL` (required): admin user email for e2e sign-in.
- `E2E_ADMIN_PASSWORD` (required): admin user password for e2e sign-in.
- `DASHBOARD_BASE_URL` (optional): dashboard URL for Playwright (defaults to `http://localhost:5173`).
- `E2E_API_BASE_URL` (optional): API URL used by e2e request helpers (defaults to `http://localhost:3000`).
- `API_SECRET` or `CLOUDINARY_API_SECRET` (required for webhook-related specs only).

Run e2e:

```bash
pnpm -C dashboard test:e2e
```

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
