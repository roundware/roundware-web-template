import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"), // Fix alias resolution
      },
    },
    define: {
      global: 'globalThis'
    },

    server: {
      port: 2345
    }
  };
});
