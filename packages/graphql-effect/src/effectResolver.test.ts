import { Effect, Stream } from 'effect';
import { GraphQLFieldResolver } from 'graphql';
import { expect, test } from 'vitest';
import { effectResolver } from './effectResolver.js';

const fromAsync = async <T>(iterator: AsyncIterable<T>) => {
  const result = [];

  for await (const value of iterator) {
    result.push(value);
  }

  return result;
};

test('should resolve Effect as a resolver value', async () => {
  const resolve: GraphQLFieldResolver<unknown, unknown> = async (
    _source,
    _args,
    _context,
    _info,
  ) => Effect.succeed(1);

  const result = await effectResolver(resolve)({}, {}, {}, {} as never);

  expect(result).toBe(1);
});

test('should resolve Stream as a resolver value', async () => {
  const resolve: GraphQLFieldResolver<unknown, unknown> = async (
    _source,
    _args,
    _context,
    _info,
  ) => Stream.range(1, 5);

  const result = await fromAsync(
    // @ts-ignore
    await effectResolver(resolve)({}, {}, {}, {} as never),
  );

  expect(result).toEqual([1, 2, 3, 4, 5]);
});
