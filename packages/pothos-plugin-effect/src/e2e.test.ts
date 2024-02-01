import SchemaBuilder from '@pothos/core';
import { Effect, Option, Runtime } from 'effect';
import { execute, parse, printSchema } from 'graphql';
import { expect, test } from 'vitest';
import EffectPlugin from './index.js';

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
  arrayNullableItems: t.effect({
    type: ['String'],
    nullable: { list: false, items: true },
    resolve: () => Effect.succeed([Option.some('1'), Option.none()]),
  }),
  arrayNullableList: t.effect({
    type: ['String'],
    nullable: { list: true, items: false },
    resolve: () => Effect.succeedSome(['1', '2']),
  }),
  arrayNullableListItems: t.effect({
    type: ['String'],
    nullable: { list: true, items: true },
    resolve: () => Effect.succeedSome([Option.some('1'), Option.none()]),
  }),
}));

const schema = builder.toSchema();

test('print schema', () => {
  expect(printSchema(schema)).toMatchInlineSnapshot(`
    "type Query {
      arrayNullableItems: [String]!
      arrayNullableList: [String!]
      arrayNullableListItems: [String]
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
    arrayNullableList
    arrayNullableItems
    arrayNullableListItems
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "arrayNullableItems": [
          "1",
          null,
        ],
        "arrayNullableList": [
          "1",
          "2",
        ],
        "arrayNullableListItems": [
          "1",
          null,
        ],
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
    }
  `);
});
