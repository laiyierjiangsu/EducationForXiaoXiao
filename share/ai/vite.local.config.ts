import tailwindcss from '@tailwindcss/postcss';
import vinext from 'vinext';
import { defineConfig } from 'vite';

// This presentation needs no Workers bindings for local preview.
export default defineConfig({
  plugins: [vinext()],
  css: { postcss: { plugins: [tailwindcss()] } },
  server: { host: '127.0.0.1', port: 3000, strictPort: true },
});
