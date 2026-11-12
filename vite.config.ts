import { defineConfig } from 'vitest/config';

export default defineConfig({
  // GitHub Pages serves the site from /<repo>/; the deploy workflow sets BASE_PATH.
  base: process.env.BASE_PATH ?? '/',
  build: { target: 'es2020' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
