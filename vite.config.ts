import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative base so the same build works at a custom domain root and at github.io/<repo>/.
  base: process.env.BASE_PATH ?? './',
  build: { target: 'es2020' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
