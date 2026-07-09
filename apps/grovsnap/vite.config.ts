import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { localFsPlugin } from './vite-plugin-local-fs';

export default defineConfig({
  plugins: [react(), localFsPlugin()],
  server: {
    port: 5174,
  },
});
