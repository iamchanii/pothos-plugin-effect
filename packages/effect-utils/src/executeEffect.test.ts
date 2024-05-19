import { Context, Effect, Layer, Option, Runtime, Scope, pipe } from 'effect';
import { expect, test } from 'vitest';
import { executeEffect } from './executeEffect.js';

test('resolve simple Effect', async () => {
  const program = Effect.succeed('Hello, World!');
  const result = await executeEffect(program, Runtime.defaultRuntime);

  expect(result).toMatchInlineSnapshot(`"Hello, World!"`);
});

test('resolve Effect which uses a service', async () => {
  class UserService extends Context.Tag('UserService')<
    UserService,
    { getCurrentUser(): Effect.Effect<{ id: number }> }
  >() {}

  const program = UserService.pipe(
    Effect.flatMap((service) => service.getCurrentUser()),
    Effect.provideService(UserService, {
      getCurrentUser: () => Effect.succeed({ id: 1 }),
    }),
  );

  const result = await executeEffect(program, Runtime.defaultRuntime);

  expect(result).toEqual({ id: 1 });
});

test('resolve Effect which returns Promise as a result', async () => {
  const program = Effect.succeed(Promise.resolve('Hello World!'));
  const result = await executeEffect(program, Runtime.defaultRuntime);

  expect(result).toMatchInlineSnapshot(`"Hello World!"`);
});

test('resolve Effect which returns null or undefined or Option as values', async () => {
  const program = Effect.succeed([
    null,
    undefined,
    Option.none(),
    Option.some(1),
  ]);
  const result = await executeEffect(program, Runtime.defaultRuntime);

  expect(result).toMatchInlineSnapshot(`
    [
      null,
      undefined,
      null,
      1,
    ]
  `);
});

test('throws if Effect has failed', async () => {
  const program = Effect.fail(new Error('Initialization error'));
  const result = await executeEffect(program, Runtime.defaultRuntime).catch(
    (error) => error,
  );

  expect(result).toMatchInlineSnapshot(`[Error: Initialization error]`);
});
