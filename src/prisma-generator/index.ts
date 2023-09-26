import { generatorHandler } from '@prisma/generator-helper';
import { dirname, resolve } from 'node:path';
import { generate } from './generate';

const __dirname = dirname(new URL(import.meta.url).pathname);
const defaultOutput = resolve(__dirname, '../prisma');

generatorHandler({
  onManifest() {
    return {
      prettyName: 'pothos-plugin-effect Integration',
      requiresGenerators: ['prisma-client-js'],
      defaultOutput,
    };
  },
  onGenerate: generate,
});
