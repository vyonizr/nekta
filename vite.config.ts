import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import loadVersion from 'vite-plugin-package-version'

export default defineConfig({
  plugins: [solidPlugin(), loadVersion()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
})
