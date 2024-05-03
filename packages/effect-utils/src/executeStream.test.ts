import { Context, Effect, Option, Runtime, Stream } from 'effect';
import { expect, test } from 'vitest';
import { executeStream } from './executeStream.js';

const fromAsync = async <T>(iterator: AsyncIterable<T>) => {
  const result = [];

  for await (const value of iterator) {
    result.push(value);
  }

  return result;
};

test('resolve simple Stream', async () => {
  const program = Stream.range(1, 5);
  const result = await fromAsync(
    executeStream(program, Runtime.defaultRuntime),
  );

  expect(result).toEqual([1, 2, 3, 4, 5]);
});

test('resolve Stream which uses a service', async () => {
  class UserService extends Context.Tag('UserService')<
    UserService,
    { getCurrentUser(): Effect.Effect<{ id: number }> }
  >() {}

  const program = Stream.fromEffect(
    UserService.pipe(
      Effect.flatMap((service) => service.getCurrentUser()),
      Effect.provideService(UserService, {
        getCurrentUser: () => Effect.succeed({ id: 1 }),
      }),
    ),
  );

  const result = await fromAsync(
    executeStream(program, Runtime.defaultRuntime),
  );

  expect(result).toEqual([{ id: 1 }]);
});

test('resolve Stream which emits null or undefined or Option as values', async () => {
  const program = Stream.make(null, undefined, Option.none(), Option.some(1));
  const result = await fromAsync(
    executeStream(program, Runtime.defaultRuntime),
  );

  expect(result).toMatchInlineSnapshot(`
    [
      null,
      undefined,
      null,
      1,
    ]
  `);
});

test('throws if Stream has emited an error', async () => {
  const program = Stream.fail(new Error('Initialization error'));
  const result = await fromAsync(
    executeStream(program, Runtime.defaultRuntime),
  ).catch((error) => error);

  expect(result).toMatchInlineSnapshot(`[Error: Initialization error]`);
});
