
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// @ts-ignore
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
