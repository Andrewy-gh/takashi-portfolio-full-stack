import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: '3000',
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-beautiful-dnd': ['react-beautiful-dnd'],
          'mui-icons-material': ['@mui/icons-material'],
        },
      },
    },
  },
});
