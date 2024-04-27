import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['*.js'],
    },
    alias: {
      graphql: 'graphql/index.js',
    },
  },
});
