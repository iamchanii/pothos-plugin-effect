import './index.js';
import SchemaBuilder from '@pothos/core';
import PrismaPlugin from '@pothos/plugin-prisma';
import { PrismaClient } from '@prisma/client';
import { Effect, Runtime } from 'effect';
import { execute, parse, printSchema } from 'graphql';
import { expect, test } from 'vitest';
import type PrismaTypes from '../../prisma/pothos-types.js';
import EffectPlugin from '../core/index.js';

const prisma = new PrismaClient();

const effectRuntime = Runtime.defaultRuntime;

const builder = new SchemaBuilder<{
  EffectRuntime: typeof effectRuntime;
  PrismaTypes: PrismaTypes;
}>({
  plugins: [EffectPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
  },
  effectOptions: { effectRuntime },
});

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
  }),
});

builder.queryType({});

builder.queryFields((t) => ({
  user: t.prismaEffect({
    type: 'User',
    resolve: (query) =>
      Effect.succeed(prisma.user.findFirstOrThrow({ ...query })),
  }),
}));

const schema = builder.toSchema();

test('print schema', () => {
  expect(printSchema(schema)).toMatchInlineSnapshot(`
    "type Query {
      user: User!
    }

    type User {
      email: String!
      id: ID!
      name: String
    }"
  `);
});

test('execute query', async () => {
  const document = parse(`{
    user {
      id
      email
      name
    }
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {},
    }
  `);
});
