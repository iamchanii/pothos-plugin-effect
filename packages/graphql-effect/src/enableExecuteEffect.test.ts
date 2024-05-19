import { makeExecutableSchema } from '@graphql-tools/schema';
import { Context, Effect, Layer, Scope, Stream } from 'effect';
import { execute, parse, subscribe } from 'graphql';
import { expect, test } from 'vitest';
import { enableExecuteEffect } from './enableExecuteEffect.js';

const fromAsync = async <T>(iterator: AsyncIterable<T>) => {
  const result = [];

  for await (const value of iterator) {
    result.push(value);
  }

  return result;
};

interface EntityService {
  getEntityContent(): Effect.Effect<string>;
}

const EntityService = Context.GenericTag<EntityService>('EntityService');

const EntityServiceLive = Layer.succeed(EntityService, {
  getEntityContent: () => Effect.succeed('bar'),
});

const baseSchema = makeExecutableSchema({
  typeDefs: `type Query {
    foo: String!
    bar: String!
  }
  
  type Subscription {
    foo: Int!
  }
  `,
  resolvers: {
    Query: {
      foo: () => {
        return Effect.succeed('foo');
      },
      bar: () =>
        Effect.gen(function* () {
          const entityService = yield* EntityService;
          return yield* entityService.getEntityContent();
        }),
    },
    Subscription: {
      foo: {
        subscribe: () => Stream.range(1, 5),
        resolve: (value) => value,
      },
    },
  },
});

test('should return "foo" as result', async () => {
  const schema = enableExecuteEffect(baseSchema);
  const result = await execute({ schema, document: parse(`{ foo }`) });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "foo": "foo",
      },
    }
  `);
});

test('should return "bar" as result', async () => {
  const scope = Effect.runSync(Scope.make());
  const runtime = await Effect.runPromise(
    Layer.toRuntime(EntityServiceLive).pipe(Scope.extend(scope)),
  );

  const schema = enableExecuteEffect(baseSchema, runtime);
  const result = await execute({ schema, document: parse(`{ bar }`) });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "bar": "bar",
      },
    }
  `);
});

test('should resolve Stream as subscription', async () => {
  const schema = enableExecuteEffect(baseSchema);
  const result = await subscribe({
    schema,
    document: parse(`subscription { foo }`),
  });

  expect(await fromAsync(result as any)).toMatchInlineSnapshot(`
    [
      {
        "data": {
          "foo": 1,
        },
      },
      {
        "data": {
          "foo": 2,
        },
      },
      {
        "data": {
          "foo": 3,
        },
      },
      {
        "data": {
          "foo": 4,
        },
      },
      {
        "data": {
          "foo": 5,
        },
      },
    ]
  `);
});
