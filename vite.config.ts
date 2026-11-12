import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: { target: 'es2020' },
  test: { environment: 'jsdom', include: ['tests/**/*.test.ts'] },
});
