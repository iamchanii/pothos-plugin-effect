import { defineConfig } from 'vite';

import packageJson from './package.json';

export default defineConfig({
  build: {
    lib: {
      entry: ['src/index.ts', 'src/field-builder.ts'],
      fileName(_format, entryName) {
        return `${entryName}.mjs`;
      },
      formats: ['es'],
    },
    minify: true,
    outDir: 'dist',
    rollupOptions: {
      external: [
        ...Object.keys(packageJson.devDependencies),
        ...Object.keys(packageJson.peerDependencies),
      ],
    },
    sourcemap: true,
  },
});
