import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import WithInputPlugin from '@pothos/plugin-with-input';
import type PrismaTypes from '../../prisma/pothos-types.js';
import EffectPlugin from '../../src/index.js';
import { setupTest } from '../setupTest.js';

const { prisma, runtime: effectRuntime } = await setupTest();

export const builder = new SchemaBuilder<{
  EffectRuntime: typeof effectRuntime;
  PrismaTypes: PrismaTypes;
}>({
  plugins: [
    EffectPlugin,
    ErrorsPlugin,
    RelayPlugin,
    PrismaPlugin,
    WithInputPlugin,
  ],
  effect: { effectRuntime },
  errors: {
    defaultTypes: [Error],
  },
  prisma: { client: prisma },
  relay: {},
});
