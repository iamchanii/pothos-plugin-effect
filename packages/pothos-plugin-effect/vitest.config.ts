import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['*.js', 'prisma/*'],
    },
    alias: {
      graphql: 'graphql/index.js',
    },
  },
});
