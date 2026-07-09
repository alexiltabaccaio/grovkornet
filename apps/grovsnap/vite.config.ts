import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localFsPlugin } from './vite-plugin-local-fs';
import { fileURLToPath } from 'url';

export default defineConfig({
  plugins: [react(), localFsPlugin()],
  resolve: {
    alias: {
      '@app': fileURLToPath(new URL('./src/app', import.meta.url)),
      '@screens': fileURLToPath(new URL('./src/screens', import.meta.url)),
      '@widgets': fileURLToPath(new URL('./src/widgets', import.meta.url)),
      '@features': fileURLToPath(new URL('./src/features', import.meta.url)),
      '@entities': fileURLToPath(new URL('./src/entities', import.meta.url)),
      '@shared': fileURLToPath(new URL('./src/shared', import.meta.url)),
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5174,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
});
