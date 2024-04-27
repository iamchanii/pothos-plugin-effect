import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import RelayPlugin, {
  resolveArrayConnection,
  resolveCursorConnection,
  resolveOffsetConnection,
} from '@pothos/plugin-relay';
import { Context, Effect, Layer, Option, Scope, pipe } from 'effect';
import { execute, parse, printSchema } from 'graphql';
import { expect, test } from 'vitest';
import EffectPlugin from './index.js';
import type PrismaTypes from '../prisma/pothos-types.js';
import { PrismaClient } from '@prisma/client';
import PrismaPlugin from '@pothos/plugin-prisma';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { Post } from '../drizzle/schema.js';
import * as drizzleSchema from '../drizzle/schema.js';

const sqlite = new Database('./prisma/dev.db');

const db = drizzle(sqlite, { schema: drizzleSchema });

const prisma = new PrismaClient();

interface EntityService {
  getEntity(): Effect.Effect<{ id: number }, Error>;
}

const EntityService = Context.GenericTag<EntityService>('EntityService');

const EntityServiceLive = Layer.succeed(EntityService, {
  getEntity: () => Effect.succeed({ id: 1 }),
});

const scope = Effect.runSync(Scope.make());

const effectRuntime = await Effect.runPromise(
  Layer.toRuntime(EntityServiceLive).pipe(Scope.extend(scope)),
);

const builder = new SchemaBuilder<{
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

const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

builder.objectType(Error, {
  name: 'BaseError',
  interfaces: [ErrorInterface],
});

const Entity = builder.objectRef<{ id: number }>('Entity').implement({
  fields: (t) => ({ id: t.exposeID('id') }),
});

builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
  }),
});

const Post = builder.objectRef<Post>('Post').implement({
  fields: (t) => ({
    id: t.exposeID('id'),
    title: t.exposeString('title'),
    content: t.exposeString('content', { nullable: true }),
  }),
});

builder.queryType({});

builder.queryFields((t) => ({
  int: t.int({
    resolve: () => t.executeEffect(Effect.succeed(1)),
  }),
  nullableInt: t.int({
    nullable: true,
    resolve: () => t.executeEffect(Effect.succeedSome(1)),
  }),
  string: t.string({
    resolve: () => t.executeEffect(Effect.succeed('1')),
  }),
  nullableString: t.string({
    nullable: true,
    resolve: () => t.executeEffect(Effect.succeedSome('1')),
  }),
  float: t.float({
    resolve: () => t.executeEffect(Effect.succeed(1.1)),
  }),
  nullableFloat: t.float({
    nullable: true,
    resolve: () => t.executeEffect(Effect.succeedSome(1.1)),
  }),
  boolean: t.boolean({
    resolve: () => t.executeEffect(Effect.succeed(true)),
  }),
  nullableBoolean: t.boolean({
    nullable: true,
    resolve: () => t.executeEffect(Effect.succeedSome(true)),
  }),
  id: t.id({
    resolve: () => t.executeEffect(Effect.succeed('1')),
  }),
  nullableId: t.id({
    nullable: true,
    resolve: () => t.executeEffect(Effect.succeedSome('1')),
  }),
  arrayString: t.stringList({
    resolve: () => t.executeEffect(Effect.succeed(['1'])),
  }),
  arrayNullableItems: t.stringList({
    nullable: { list: false, items: true },
    resolve: () =>
      t.executeEffect(Effect.succeed([Option.some('1'), Option.none()])),
  }),
  arrayNullableList: t.stringList({
    nullable: { list: true, items: false },
    resolve: () => t.executeEffect(Effect.succeedSome(['1', '2'])),
  }),
  arrayNullableListItems: t.stringList({
    nullable: { list: true, items: true },
    resolve: () =>
      t.executeEffect(Effect.succeedSome([Option.some('1'), Option.none()])),
  }),
  object: t.field({
    type: Entity,
    resolve: () =>
      t.executeEffect(
        pipe(
          EntityService,
          Effect.flatMap((service) => service.getEntity()),
        ),
      ),
  }),
  promiseObject: t.field({
    type: Entity,
    resolve: () => t.executeEffect(Effect.succeed(Promise.resolve({ id: 1 }))),
  }),
  getEntity: t.field({
    type: Entity,
    errors: {
      types: [Error],
    },
    resolve: () => t.executeEffect(Effect.succeed({ id: 1 })),
  }),
  connection: t.connection({
    type: 'String',
    resolve: async (_root, args) => {
      const result = await t.executeEffect(
        Effect.succeed(['1', '2', '3', '4']),
      );
      //    ^?

      return resolveArrayConnection({ args }, result);
    },
  }),
  nullableConnection: t.connection({
    type: 'String',
    nullable: true,
    resolve: async (_root, args) => {
      const result = await t.executeEffect(
        Effect.succeed(['1', '2', '3', null]),
      );
      //    ^?

      return resolveArrayConnection({ args }, result);
    },
  }),
  nullableItemConnection: t.connection({
    type: 'String',
    nullable: true,
    resolve: async (_root, args) => {
      const result = await t.executeEffect(
        Effect.succeed(['1', '2', '3', null]),
      );
      //    ^?

      return resolveArrayConnection({ args }, result);
    },
  }),
  cursorConnection: t.connection({
    type: 'String',
    resolve: async (_root, args) => {
      return resolveCursorConnection(
        { args, toCursor: (value) => value },
        async () => {
          const result = await t.executeEffect(Effect.succeed(['1', '2', '3']));
          //    ^?

          return result;
        },
      );
    },
  }),
  offsetConnection: t.connection({
    type: 'String',
    nullable: true,
    resolve: async (_root, args) => {
      return resolveOffsetConnection({ args }, async () => {
        const result = await t.executeEffect(
          //    ^?
          Effect.succeed([
            Option.some('1'),
            Option.some('2'),
            Option.some('3'),
            Option.none(),
          ]),
        );

        return result;
      });
    },
  }),
  user: t.prismaField({
    type: 'User',
    resolve: (query) =>
      t.executeEffect(
        Effect.succeed(prisma.user.findFirstOrThrow({ ...query })),
      ),
  }),
  userConnection: t.prismaConnection({
    type: 'User',
    cursor: 'id',
    resolve: (query) =>
      t.executeEffect(Effect.succeed(prisma.user.findMany(query))),
  }),
  post: t.field({
    type: Post,
    nullable: true,
    resolve: () => t.executeEffect(Effect.succeed(db.query.posts.findFirst())),
  }),
}));

const schema = builder.toSchema();

test('print schema', () => {
  expect(printSchema(schema)).toMatchInlineSnapshot(`
    "type BaseError implements Error {
      message: String!
    }

    type Entity {
      id: ID!
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

    type Post {
      content: String
      id: ID!
      title: String!
    }

    type Query {
      arrayNullableItems: [String]!
      arrayNullableList: [String!]
      arrayNullableListItems: [String]
      arrayString: [String!]!
      boolean: Boolean!
      connection(after: ID, before: ID, first: Int, last: Int): QueryConnection!
      cursorConnection(after: ID, before: ID, first: Int, last: Int): QueryCursorConnection!
      float: Float!
      getEntity: QueryGetEntityResult!
      id: ID!
      int: Int!
      nullableBoolean: Boolean
      nullableConnection(after: ID, before: ID, first: Int, last: Int): QueryNullableConnection
      nullableFloat: Float
      nullableId: ID
      nullableInt: Int
      nullableItemConnection(after: ID, before: ID, first: Int, last: Int): QueryNullableItemConnection
      nullableString: String
      object: Entity!
      offsetConnection(after: ID, before: ID, first: Int, last: Int): QueryOffsetConnection
      post: Post
      promiseObject: Entity!
      string: String!
      user: User!
      userConnection(after: ID, before: ID, first: Int, last: Int): QueryUserConnection!
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

    union QueryGetEntityResult = BaseError | QueryGetEntitySuccess

    type QueryGetEntitySuccess {
      data: Entity!
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

    type QueryUserConnection {
      edges: [QueryUserConnectionEdge]!
      pageInfo: PageInfo!
    }

    type QueryUserConnectionEdge {
      cursor: String!
      node: User!
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
    object { id }
    promiseObject { id }
    getEntity {
      __typename
      ... on QueryGetEntitySuccess {
        data { id }
      }
    }
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
    user {
      id
      email
    }
    userConnection {
      edges { cursor node { id email } }
    }
    post {
      id
      title
      content
    }
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
          ],
        },
        "float": 1.1,
        "getEntity": {
          "__typename": "QueryGetEntitySuccess",
          "data": {
            "id": "1",
          },
        },
        "id": "1",
        "int": 1,
        "nullableBoolean": true,
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
        "nullableFloat": 1.1,
        "nullableId": "1",
        "nullableInt": 1,
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
        "nullableString": "1",
        "object": {
          "id": "1",
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
            null,
          ],
        },
        "post": {
          "content": "Book Content",
          "id": "1",
          "title": "Book Title",
        },
        "promiseObject": {
          "id": "1",
        },
        "string": "1",
        "user": {
          "email": "john@acme.com",
          "id": "1",
        },
        "userConnection": {
          "edges": [
            {
              "cursor": "R1BDOk46MQ==",
              "node": {
                "email": "john@acme.com",
                "id": "1",
              },
            },
          ],
        },
      },
    }
  `);
});
