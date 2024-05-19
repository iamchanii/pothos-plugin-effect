import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import RelayPlugin from '@pothos/plugin-relay';
import type PrismaTypes from '../../prisma/pothos-types.js';
import EffectPlugin from '../../src/index.js';
import { setupTest } from '../setupTest.js';

const { prisma, runtime: effectRuntime } = await setupTest();

export const builder = new SchemaBuilder<{
  EffectRuntime: typeof effectRuntime;
  PrismaTypes: PrismaTypes;
}>({
  plugins: [EffectPlugin, ErrorsPlugin, RelayPlugin, PrismaPlugin],
  effectOptions: { effectRuntime },
  errorOptions: {
    defaultTypes: [Error],
  },
  prisma: { client: prisma },
  relayOptions: {},
});
