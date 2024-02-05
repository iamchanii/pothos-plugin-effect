import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import RelayPlugin from '@pothos/plugin-relay';
import { Console, Context, Effect, Layer, Option, Scope, pipe } from 'effect';
import { execute, parse, printSchema } from 'graphql';
import { expect, test } from 'vitest';
import EffectPlugin from '../core/index.js';
import {
  CursorConnectionArgs,
  OffsetConnectionArgs,
  resolveArrayConnectionEffect,
  resolveCursorConnectionEffect,
  resolveOffsetConnectionEffect,
} from './index.js';

interface UserService {
  getUser(): Effect.Effect<never, Error, { id: number }>;
  getAllUsers(): Effect.Effect<never, Error, { id: number }[]>;
}

const UserService = Context.Tag<UserService>('UserService');

const UserServiceLive = Layer.succeed(UserService, {
  getUser: () => Effect.succeed({ id: 1 }),
  getAllUsers: () => Effect.succeed([{ id: 1 }, { id: 2 }]),
});

const scope = Effect.runSync(Scope.make());

const effectRuntime = await Effect.runPromise(
  Layer.toRuntime(UserServiceLive).pipe(Scope.extend(scope)),
);

const builder = new SchemaBuilder<{ EffectRuntime: typeof effectRuntime }>({
  plugins: [EffectPlugin, ErrorsPlugin, RelayPlugin],
  effectOptions: { effectRuntime },
  errorOptions: {
    defaultTypes: [Error],
  },
  relayOptions: {},
});

const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

builder.objectType(Error, {
  name: 'BaseError',
  interfaces: [ErrorInterface],
});

const User = builder.objectRef<{ id: number }>('User').implement({
  fields: (t) => ({ id: t.exposeID('id') }),
});

builder.queryType({});

builder.queryFields((t) => ({
  connection: t.effectConnection({
    type: 'String',
    resolve: (_root, args) =>
      pipe(
        Effect.succeed(['1', '2', '3', '4']),
        resolveArrayConnectionEffect({ args }),
      ),
  }),
  nullableConnection: t.effectConnection({
    type: 'String',
    nullable: true,
    resolve: (_root, args) =>
      pipe(
        Effect.succeedSome(['1', '2', '3', null]),
        resolveArrayConnectionEffect({ args }),
      ),
  }),
  nullableItemConnection: t.effectConnection({
    type: 'String',
    nullable: true,
    resolve: (_root, args) =>
      pipe(
        Effect.succeed([
          Option.some('1'),
          Option.some('2'),
          Option.some('3'),
          Option.none(),
        ]),
        resolveArrayConnectionEffect({ args }),
      ),
  }),
  cursorConnection: t.effectConnection({
    type: 'String',
    resolve: (_root, args) =>
      pipe(
        CursorConnectionArgs,
        Effect.tap((args) => Console.log({ args })),
        Effect.map(() => ['1', '2', '3', '4']),
        resolveCursorConnectionEffect({ args, toCursor: (value) => value }),
      ),
  }),
  offsetConnection: t.effectConnection({
    type: 'String',
    resolve: (_root, args) =>
      pipe(
        OffsetConnectionArgs,
        Effect.tap((args) => Console.log({ args })),
        Effect.map(() => ['1', '2', '3', '4']),
        resolveOffsetConnectionEffect({ args }),
      ),
  }),
}));

const schema = builder.toSchema();

test('print schema', () => {
  expect(printSchema(schema)).toMatchInlineSnapshot(`
    "type BaseError implements Error {
      message: String!
    }

    interface Error {
      message: String!
    }

    type PageInfo {
      endCursor: String
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
    }

    type Query {
      connection(after: ID, before: ID, first: Int, last: Int): QueryConnection!
      cursorConnection(after: ID, before: ID, first: Int, last: Int): QueryCursorConnection!
      nullableConnection(after: ID, before: ID, first: Int, last: Int): QueryNullableConnection
      nullableItemConnection(after: ID, before: ID, first: Int, last: Int): QueryNullableItemConnection
      offsetConnection(after: ID, before: ID, first: Int, last: Int): QueryOffsetConnection!
    }

    type QueryConnection {
      edges: [QueryConnectionEdge]!
      pageInfo: PageInfo!
    }

    type QueryConnectionEdge {
      cursor: String!
      node: String!
    }

    type QueryCursorConnection {
      edges: [QueryCursorConnectionEdge]!
      pageInfo: PageInfo!
    }

    type QueryCursorConnectionEdge {
      cursor: String!
      node: String!
    }

    type QueryNullableConnection {
      edges: [QueryNullableConnectionEdge]!
      pageInfo: PageInfo!
    }

    type QueryNullableConnectionEdge {
      cursor: String!
      node: String!
    }

    type QueryNullableItemConnection {
      edges: [QueryNullableItemConnectionEdge]!
      pageInfo: PageInfo!
    }

    type QueryNullableItemConnectionEdge {
      cursor: String!
      node: String!
    }

    type QueryOffsetConnection {
      edges: [QueryOffsetConnectionEdge]!
      pageInfo: PageInfo!
    }

    type QueryOffsetConnectionEdge {
      cursor: String!
      node: String!
    }

    type User {
      id: ID!
    }"
  `);
});

test('execute query', async () => {
  const document = parse(`{
    connection {
      edges { cursor node }
    }
    nullableConnection {
      edges { cursor node }
    }
    nullableItemConnection {
      edges { cursor node }
    }
    cursorConnection {
      edges { cursor node }
    }
    offsetConnection {
      edges { cursor node }
    }
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "connection": {
          "edges": [
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
              "node": "1",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
              "node": "2",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
              "node": "3",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoz",
              "node": "4",
            },
          ],
        },
        "cursorConnection": {
          "edges": [
            {
              "cursor": "1",
              "node": "1",
            },
            {
              "cursor": "2",
              "node": "2",
            },
            {
              "cursor": "3",
              "node": "3",
            },
            {
              "cursor": "4",
              "node": "4",
            },
          ],
        },
        "nullableConnection": {
          "edges": [
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
              "node": "1",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
              "node": "2",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
              "node": "3",
            },
            null,
          ],
        },
        "nullableItemConnection": {
          "edges": [
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
              "node": "1",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
              "node": "2",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
              "node": "3",
            },
            null,
          ],
        },
        "offsetConnection": {
          "edges": [
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
              "node": "1",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
              "node": "2",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
              "node": "3",
            },
            {
              "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoz",
              "node": "4",
            },
          ],
        },
      },
    }
  `);
});
