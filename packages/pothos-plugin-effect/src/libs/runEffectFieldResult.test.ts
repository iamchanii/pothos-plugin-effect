import { Context, Effect, Layer, Option, Runtime, Scope, pipe } from 'effect';
import { expect, test } from 'vitest';
import { runEffectFieldResult } from './runEffectFieldResult.js';

interface UserService {
  getUser(): Effect.Effect<never, Error, { id: number }>;
  findUser(
    id: number,
  ): Effect.Effect<never, Error, Option.Option<{ id: number }>>;
  queryUsers(): Effect.Effect<never, Error, Option.Option<{ id: number }>[]>;
}

const UserService = Context.Tag<UserService>('UserService');

const UserServiceLive = Layer.succeed(UserService, {
  getUser: () => Effect.succeed({ id: 1 }),
  findUser: (id) =>
    Effect.succeed(id === 1 ? Option.some({ id: 1 }) : Option.none()),
  queryUsers: () => Effect.succeed([Option.some({ id: 1 }), Option.none()]),
});

const scope = Effect.runSync(Scope.make());

const runtime = await Effect.runPromise(
  Layer.toRuntime(UserServiceLive).pipe(Scope.extend(scope)),
);

test('resolve effect field result', async () => {
  const program = pipe(
    UserService,
    Effect.flatMap((service) => service.getUser()),
  );

  const result = await runEffectFieldResult(program, runtime);

  expect(result).toEqual({ id: 1 });
});

test.only('resolve effect field with Promise result', async () => {
  const program = Effect.succeed(Promise.resolve({ id: 1 }));

  const result = await runEffectFieldResult(program, runtime);

  expect(result).toEqual({ id: 1 });
});

test('resolve effect field with Option.some result', async () => {
  const program = pipe(
    UserService,
    Effect.flatMap((service) => service.findUser(1)),
  );

  const result = await runEffectFieldResult(program, runtime);

  expect(result).toEqual({ id: 1 });
});

test('resolve effect field with Option.none result', async () => {
  const program = pipe(
    UserService,
    Effect.flatMap((service) => service.findUser(2)),
  );

  const result = await runEffectFieldResult(program, runtime);

  expect(result).toBeNull();
});

test('resolve effect field with array Option result', async () => {
  const program = pipe(
    UserService,
    Effect.flatMap((service) => service.queryUsers()),
  );

  const result = await runEffectFieldResult(program, runtime);

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "id": 1,
      },
      null,
    ]
  `);
});

test('throw effect field if program is fail', async () => {
  const program = Effect.fail(new Error('Initialization error'));

  const result = await runEffectFieldResult(program, runtime).catch(
    (error) => error,
  );

  expect(result).toMatchInlineSnapshot(`[Error: Initialization error]`);
});

test('throw effect field if service is not provided', async () => {
  const program = pipe(
    UserService,
    Effect.flatMap((service) => service.getUser()),
  );

  const result = await runEffectFieldResult(
    program,
    Runtime.defaultRuntime as never,
  ).catch((error) => error);

  expect(result).toBeInstanceOf(Error);
  expect(result.message).toContain('Service not found: UserService');
});
