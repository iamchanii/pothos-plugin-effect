import { makeExecutableSchema } from '@graphql-tools/schema';
import { Context, Effect, Layer, Scope } from 'effect';
import { execute, parse } from 'graphql';
import { expect, test } from 'vitest';
import { enableExecuteEffect } from './enableExecuteEffect.js';

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
  }`,
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
