import SchemaBuilder from '@pothos/core';
import { expect, test } from 'vitest';
import EffectPlugin from './index.js';
import { Runtime, Effect, Option } from 'effect';
import { execute, lexicographicSortSchema, parse, printSchema } from 'graphql';

const effectRuntime = Runtime.defaultRuntime;

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
  effectOptions: { effectRuntime },
});

builder.queryType({});

builder.queryFields((t) => ({
  int: t.effect({
    type: 'Int',
    resolve: () => Effect.succeed(1),
  }),
  nullableInt: t.effect({
    type: 'Int',
    nullable: true,
    resolve: () => Effect.succeedSome(1),
  }),
  string: t.effect({
    type: 'String',
    resolve: () => Effect.succeed('1'),
  }),
  nullableString: t.effect({
    type: 'String',
    nullable: true,
    resolve: () => Effect.succeedSome('1'),
  }),
  float: t.effect({
    type: 'Float',
    resolve: () => Effect.succeed(1.1),
  }),
  nullableFloat: t.effect({
    type: 'Float',
    nullable: true,
    resolve: () => Effect.succeedSome(1.1),
  }),
  boolean: t.effect({
    type: 'Boolean',
    resolve: () => Effect.succeed(true),
  }),
  nullableBoolean: t.effect({
    type: 'Boolean',
    nullable: true,
    resolve: () => Effect.succeedSome(true),
  }),
  id: t.effect({
    type: 'ID',
    resolve: () => Effect.succeed('1'),
  }),
  nullableId: t.effect({
    type: 'ID',
    nullable: true,
    resolve: () => Effect.succeedSome('1'),
  }),
  arrayString: t.effect({
    type: ['String'],
    resolve: () => Effect.succeed(['1']),
  }),
  arrayNullableString: t.effect({
    type: ['String'],
    nullable: true,
    resolve: () => Effect.succeedSome(['1', null, '2']),
  }),
}));

const schema = builder.toSchema();

test('print schema', () => {
  expect(printSchema(schema)).toMatchInlineSnapshot(`
    "type Query {
      arrayNullableString: [String!]
      arrayString: [String!]!
      boolean: Boolean!
      float: Float!
      id: ID!
      int: Int!
      nullableBoolean: Boolean
      nullableFloat: Float
      nullableId: ID
      nullableInt: Int
      nullableString: String
      string: String!
    }"
  `);
});

test('execute query', async () => {
  const document = parse(`{
    int
    nullableInt
    string
    nullableString
    float
    nullableFloat
    boolean
    nullableBoolean
    id
    nullableId
    arrayString
    arrayNullableString
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "arrayNullableString": null,
        "arrayString": [
          "1",
        ],
        "boolean": true,
        "float": 1.1,
        "id": "1",
        "int": 1,
        "nullableBoolean": true,
        "nullableFloat": 1.1,
        "nullableId": "1",
        "nullableInt": 1,
        "nullableString": "1",
        "string": "1",
      },
      "errors": [
        [GraphQLError: Cannot return null for non-nullable field Query.arrayNullableString.],
      ],
    }
  `);
});
