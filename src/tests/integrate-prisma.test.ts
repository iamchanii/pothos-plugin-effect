import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import PrismaPlugin from '@pothos/plugin-prisma';
import type PrismaTypes from '@pothos/plugin-prisma/generated';
import { Console, Context, Effect, pipe } from 'effect';
import EffectPlugin from '../index';
import { execute } from './fixtures/execute';
import prisma from './fixtures/prisma';
import { Dice } from './fixtures/services';
import { PrismaEffect } from './fixtures/prisma-client/generated';

describe('prisma', () => {
  let builder: InstanceType<
    typeof SchemaBuilder<{
      PrismaTypes: PrismaTypes;
    }>
  >;

  let queries: unknown[] = [];
  prisma.$use((params, next) => {
    queries.push(params);

    return next(params);
  });

  afterEach(() => {
    queries = [];
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(() => {
    builder = new SchemaBuilder<{
      PrismaTypes: PrismaTypes;
    }>({
      plugins: [PrismaPlugin, EffectPlugin],
      relayOptions: {},
      prisma: { client: prisma },
    });

    builder.prismaObject('Post', {
      name: 'Post',
      select: { id: true },
      fields: t => ({
        id: t.exposeID('id'),
        title: t.exposeString('title'),
        author: t.relation('author'),
      }),
    });

    builder.prismaObject('User', {
      name: 'User',
      select: { id: true },
      fields: t => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        posts: t.relation('posts'),
      }),
    });
  });

  it('t.prismaEffect should allow query using prisma client', async () => {
    builder.queryType({
      fields: t => ({
        user: t.prismaEffect({
          type: 'User',
          resolve(query) {
            return PrismaEffect.user.findUniqueOrThrow({
              ...query,
              where: { id: 1 },
            });
          },
        }),
      }),
    });

    const result = await execute(
      builder,
      /* GraphQL */ `
    {
      user {
        id
        name
        posts {
          id
        }
      } 
    }`,
    );

    expect(result.data).toMatchInlineSnapshot(`
{
  "user": {
    "id": "1",
    "name": "John Doe",
    "posts": [
      {
        "id": "1",
      },
      {
        "id": "2",
      },
      {
        "id": "3",
      },
    ],
  },
}
`);
    expect(queries).toMatchInlineSnapshot(`
[
  {
    "action": "findUniqueOrThrow",
    "args": {
      "select": {
        "id": true,
        "name": true,
        "posts": {
          "select": {
            "id": true,
          },
        },
      },
      "where": {
        "id": 1,
      },
    },
    "dataPath": [],
    "model": "User",
    "runInTransaction": false,
  },
]
`);
  });

  it('t.prismaEffect can uses effect options', async () => {
    builder.queryType({
      fields: t => ({
        randomUser: t.prismaEffect({
          type: 'User',
          effect: {
            contexts: [Context.make(Dice, Dice.of({ roll: () => Effect.succeed(1) }))],
          },
          resolve(query) {
            return pipe(
              Dice,
              Effect.flatMap(dice => dice.roll()),
              Effect.flatMap(id =>
                PrismaEffect.user.findUniqueOrThrow({
                  ...query,
                  where: { id },
                })
              ),
            );
          },
        }),
      }),
    });

    const result = await execute(
      builder,
      /* GraphQL */ `
    {
      randomUser {
        id
        name
      } 
    }`,
    );

    expect(result.data).toMatchInlineSnapshot(`
{
  "randomUser": {
    "id": "1",
    "name": "John Doe",
  },
}
`);
    expect(queries).toMatchInlineSnapshot(`
[
  {
    "action": "findUniqueOrThrow",
    "args": {
      "select": {
        "id": true,
        "name": true,
      },
      "where": {
        "id": 1,
      },
    },
    "dataPath": [],
    "model": "User",
    "runInTransaction": false,
  },
]
`);
  });

  it('t.prismaEffect can uses in mutation field', async () => {
    builder.queryType({
      fields: t => ({
        noop: t.string({ resolve: () => '' }),
      }),
    });

    builder.mutationType({
      fields: t => ({
        createUser: t.prismaEffect({
          type: 'User',
          args: {
            name: t.arg.string({ required: true }),
          },
          resolve(query, _parent, args) {
            return Effect.gen(function*(_) {
              const user = yield* _(PrismaEffect.user.create({
                ...query,
                data: { name: args.name },
              }));

              return user;
            });
          },
        }),
      }),
    });

    const result = await execute(
      builder,
      /* GraphQL */ `
    mutation {
      createUser(name: "James Bond") {
        name
      } 
    }`,
    );

    expect(result.data).toMatchInlineSnapshot(`
{
  "createUser": {
    "name": "James Bond",
  },
}
`);
    expect(queries).toMatchInlineSnapshot(`
[
  {
    "action": "create",
    "args": {
      "data": {
        "name": "James Bond",
      },
      "select": {
        "id": true,
        "name": true,
      },
    },
    "dataPath": [],
    "model": "User",
    "runInTransaction": false,
  },
]
`);
  });

  fit('t.prismaEffect should throw error if prisma cause error', async () => {
    builder.queryType({
      fields: t => ({
        user: t.prismaEffect({
          type: 'User',
          resolve(query) {
            return PrismaEffect.user.findUniqueOrThrow({
              ...query,
              // @ts-ignore
              where: { id: '100' },
            }).pipe(
              Effect.catchAll(Console.error),
            );
          },
        }),
      }),
    });

    const result = await execute(
      builder,
      /* GraphQL */ `{ user { id }  }`,
    );

    expect(result.errors?.[0].originalError).toMatchInlineSnapshot(
      `[Error: Error: {"_tag":"PrismaClientValidationError","message":"\\nInvalid \`prisma.user.findUniqueOrThrow()\` invocation:\\n\\n{\\n  select: {\\n    id: true\\n  },\\n  where: {\\n    id: \\"100\\"\\n        ~~~~~\\n  }\\n}\\n\\nArgument \`id\`: Invalid value provided. Expected Int, provided String.","cause":{"name":"PrismaClientValidationError","clientVersion":"5.3.0"}}]`,
    );
  });
});

describe('integration with errors', () => {
  let builder: InstanceType<
    typeof SchemaBuilder<{
      PrismaTypes: PrismaTypes;
    }>
  >;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(() => {
    builder = new SchemaBuilder<{
      PrismaTypes: PrismaTypes;
    }>({
      plugins: [PrismaPlugin, ErrorsPlugin, EffectPlugin],
      relayOptions: {},
      errorOptions: {
        defaultTypes: [Error],
      },
      prisma: { client: prisma },
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

    builder.prismaObject('Post', {
      name: 'Post',
      select: { id: true },
      fields: t => ({
        id: t.exposeID('id'),
        title: t.exposeString('title'),
        author: t.relation('author'),
      }),
    });

    builder.prismaObject('User', {
      name: 'User',
      select: { id: true },
      fields: t => ({
        id: t.exposeID('id'),
        name: t.exposeString('name'),
        posts: t.relation('posts'),
      }),
    });
  });

  it('t.prismaEffect can be integrated with errors plugin', async () => {
    let roll = 0;

    builder.queryType({
      fields: t => ({
        user: t.prismaEffect({
          type: 'User',
          errors: {
            types: [Error],
          },
          effect: {
            contexts: [Context.make(
              Dice,
              Dice.of({
                roll: () => Effect.succeed(++roll),
              }),
            )],
          },
          resolve(query) {
            return Effect.gen(function*(_) {
              const dice = yield* _(Dice);
              const rollResult = yield* _(dice.roll());

              if (rollResult === 1) {
                return yield* _(Effect.fail(new Error('No user found')));
              }

              return yield* _(PrismaEffect.user.findUniqueOrThrow({
                ...query,
                where: { id: 1 },
              }));
            });
          },
        }),
      }),
    });

    const source = /* GraphQL */ `{
      user {
        __typename
        ... on QueryUserSuccess {
          data {
            __typename
          }
        }
        ... on BaseError {
          message
        }
      }
    }`;

    const result = await execute(builder, source);
    expect(result.data).toMatchInlineSnapshot(`
{
  "user": {
    "__typename": "BaseError",
    "message": "No user found",
  },
}
`);

    const result2 = await execute(builder, source);
    expect(result2.data).toMatchInlineSnapshot(`
{
  "user": {
    "__typename": "QueryUserSuccess",
    "data": {
      "__typename": "User",
    },
  },
}
`);
  });
});
