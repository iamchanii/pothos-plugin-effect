import { Context, Effect, Layer, Option, pipe } from 'effect';
import SchemaBuilder from '@pothos/core';
import { execute, parse } from 'graphql';

import EffectPlugin from '../index.ts';
import { Dice, Notification } from './fixtures/services.ts';

interface SchemaTypes {
  Context: {
    diceResult: number;
  };
}

let builder: InstanceType<typeof SchemaBuilder<SchemaTypes>>;

beforeEach(() => {
  builder = new SchemaBuilder<SchemaTypes>({
    plugins: [EffectPlugin],
  });

  builder.queryType({});
});

it('should reject Effect if requirements are not met', async () => {
  builder.queryField('error', t =>
    t.effect({
      effect: {
        contexts: [],
        services: [],
      },
      resolve: () =>
        // @ts-expect-error
        pipe(
          Dice,
          Effect.flatMap(dice => dice.roll()),
        ),
      type: 'Int',
    }));

  const schema = builder.toSchema();
  const document = parse(`{ error }`);
  const result = await execute({ document, schema });

  expect(result.data).toBeNull();
  expect(result.errors).not.toBeNull();
});

describe('effect.services', () => {
  it('should resolve Effect with injected services', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          services: [
            [Dice, Dice.of({ roll: () => Effect.succeed(6) })],
          ],
        },
        resolve: () =>
          pipe(
            Dice,
            Effect.flatMap(dice => dice.roll()),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: 6 });
  });

  it('should inject services with context and resolve Effect', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          services: [
            [Dice, (context: SchemaTypes['Context']) => Dice.of({ roll: () => Effect.succeed(context.diceResult) })],
          ],
        },
        resolve: () =>
          pipe(
            Dice,
            Effect.flatMap(dice => dice.roll()),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({
      contextValue: { diceResult: 42 } satisfies SchemaTypes['Context'],
      document,
      schema,
    });

    expect(result.data).toEqual({ roll: 42 });
  });
});

describe('effect.contexts', () => {
  it('should resolve Effect with injected contexts', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          contexts: [
            pipe(
              Context.empty(),
              Context.add(Dice, Dice.of({ roll: () => Effect.succeed(5) })),
            ),
          ],
        },
        resolve: () =>
          pipe(
            Dice,
            Effect.flatMap(dice => dice.roll()),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: 5 });
  });

  it('should inject contexts with context and resolve Effect', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          contexts: [
            (context: SchemaTypes['Context']) =>
              pipe(
                Context.empty(),
                Context.add(Dice, Dice.of({ roll: () => Effect.succeed(context.diceResult) })),
              ),
          ],
        },
        resolve: () =>
          pipe(
            Dice,
            Effect.flatMap(dice => dice.roll()),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({
      contextValue: { diceResult: 42 } satisfies SchemaTypes['Context'],
      document,
      schema,
    });

    expect(result.data).toEqual({ roll: 42 });
  });
});

describe('effect.layers', () => {
  it('should resolve Effect with injected layers', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          layers: [
            Layer.succeed(Dice, Dice.of({ roll: () => Effect.succeed(6) })),
          ],
        },
        // FIXME: After update effect/io, To avoid type error, should be use function instead of arrow function
        resolve() {
          return pipe(
            Dice,
            Effect.flatMap(dice => dice.roll()),
          );
        },
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: 6 });
  });

  it('should inject layers with context and resolve Effect', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          layers: [
            (context: SchemaTypes['Context']) =>
              Layer.succeed(
                Dice,
                Dice.of({ roll: () => Effect.succeed(context.diceResult) }),
              ),
          ],
        },
        resolve: () =>
          pipe(
            Dice,
            Effect.flatMap(dice => dice.roll()),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({
      contextValue: { diceResult: 42 } satisfies SchemaTypes['Context'],
      document,
      schema,
    });

    expect(result.data).toEqual({ roll: 42 });
  });
});

describe('effectOptions.globalLayer', () => {
  interface SchemaTypes2 {
    Context: {
      message: string;
    };
    EffectGlobalLayer: Layer.Layer<never, never, Notification>;
  }

  it('should resolve Effect with injected global layer', async () => {
    const builder = new SchemaBuilder<SchemaTypes2>({
      effectOptions: {
        globalLayer: Layer.succeed(
          Notification,
          Notification.of({ notify: (message) => Effect.log(message) }),
        ),
      },
      plugins: [EffectPlugin],
    });

    builder.queryType({});

    const consoleSpy = jest.spyOn(console, 'log');

    builder.queryField('roll', t =>
      t.effect({
        effect: {
          layers: [],
        },
        resolve: () =>
          pipe(
            Notification,
            Effect.tap(notification => notification.notify('Hello World!')),
            Effect.map(() => 1),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: 1 });
    expect(consoleSpy.mock.lastCall?.at(0)).toContain('Hello World!');

    consoleSpy.mockRestore();
  });

  it('should inject global layer with context and resolve effect', async () => {
    const builder = new SchemaBuilder<SchemaTypes2>({
      effectOptions: {
        globalLayer: (context) =>
          Layer.succeed(
            Notification,
            Notification.of({ notify: () => Effect.log(context.message) }),
          ),
      },
      plugins: [EffectPlugin],
    });

    builder.queryType({});

    const consoleSpy = jest.spyOn(console, 'log');

    builder.queryField('roll', t =>
      t.effect({
        effect: {
          layers: [],
        },
        resolve: () =>
          pipe(
            Notification,
            Effect.tap(notification => notification.notify('Hello World!')),
            Effect.map(() => 1),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ contextValue: { message: 'Hola!' }, document, schema });

    expect(result.data).toEqual({ roll: 1 });
    expect(consoleSpy.mock.lastCall?.at(0)).toContain('Hola!');

    consoleSpy.mockRestore();
  });
});

describe('effectOptions.globalContext', () => {
  interface SchemaTypes3 {
    Context: {
      message: string;
    };
    EffectGlobalContext: Context.Context<Notification>;
  }

  it('should resolve Effect with injected global layer', async () => {
    const builder = new SchemaBuilder<SchemaTypes3>({
      effectOptions: {
        globalContext: Context.make(
          Notification,
          Notification.of({ notify: (message) => Effect.log(message) }),
        ),
      },
      plugins: [EffectPlugin],
    });

    builder.queryType({});

    const consoleSpy = jest.spyOn(console, 'log');

    builder.queryField('roll', t =>
      t.effect({
        effect: {
          contexts: [],
        },
        resolve: () =>
          pipe(
            Notification,
            Effect.tap(notification => notification.notify('Hello World!')),
            Effect.map(() => 1),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: 1 });
    expect(consoleSpy.mock.lastCall?.at(0)).toContain('Hello World!');

    consoleSpy.mockRestore();
  });

  it('should inject global layer with context and resolve effect', async () => {
    const builder = new SchemaBuilder<SchemaTypes3>({
      effectOptions: {
        globalContext: (context) =>
          Context.make(
            Notification,
            Notification.of({ notify: () => Effect.log(context.message) }),
          ),
      },
      plugins: [EffectPlugin],
    });

    builder.queryType({});

    const consoleSpy = jest.spyOn(console, 'log');

    builder.queryField('roll', t =>
      t.effect({
        effect: {
          contexts: [],
        },
        resolve: () =>
          pipe(
            Notification,
            Effect.tap(notification => notification.notify('Hello World!')),
            Effect.map(() => 1),
          ),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ contextValue: { message: 'Hola!' }, document, schema });

    expect(result.data).toEqual({ roll: 1 });
    expect(consoleSpy.mock.lastCall?.at(0)).toContain('Hola!');

    consoleSpy.mockRestore();
  });
});

describe('Option', () => {
  it('should resolve Option<T> to T if Some', async () => {
    builder.queryField('roll', t =>
      t.effect({
        nullable: true,
        resolve: () => Effect.succeed(Option.some(6)),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: 6 });
    expect(result.errors).toBeUndefined();
  });

  it('should resolve Option<T> to null if None', async () => {
    builder.queryField('roll', t =>
      t.effect({
        nullable: true,
        resolve: () => Effect.succeed(Option.none()),
        type: 'Int',
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: null });
    expect(result.errors).toBeUndefined();
  });

  it('should resolve Option<T>[]', async () => {
    builder.queryField('roll', t =>
      t.effect({
        nullable: { items: true, list: false },
        resolve: () =>
          Effect.succeed([
            Option.some(1),
            Option.some(2),
            Option.none(),
            Option.some(4),
          ]),
        type: ['Int'],
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: [1, 2, null, 4] });
    expect(result.errors).toBeUndefined();
  });

  it('should resolve Option<T[]>', async () => {
    builder.queryField('roll', t =>
      t.effect({
        nullable: { items: false, list: true },
        resolve: () => Effect.succeed(Option.some([1, 2, 3, 4])),
        type: ['Int'],
      }));

    builder.queryField('roll2', t =>
      t.effect({
        nullable: { items: false, list: true },
        resolve: () => Effect.succeed(Option.none()),
        type: ['Int'],
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll roll2 }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: [1, 2, 3, 4], roll2: null });
    expect(result.errors).toBeUndefined();
  });

  it('should resolve Option<Option<T>[]>', async () => {
    builder.queryField('roll', t =>
      t.effect({
        nullable: { items: true, list: true },
        resolve: () =>
          Effect.succeed(Option.some([
            Option.some(1),
            Option.some(2),
            Option.none(),
            Option.some(4),
          ])),
        type: ['Int'],
      }));

    builder.queryField('roll2', t =>
      t.effect({
        nullable: { items: true, list: true },
        resolve: () => Effect.succeed(Option.none()),
        type: ['Int'],
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll roll2 }`);
    const result = await execute({ document, schema });

    expect(result.data).toEqual({ roll: [1, 2, null, 4], roll2: null });
    expect(result.errors).toBeUndefined();
  });
});

describe('failErrorConstructor', () => {
  class NonError {
    readonly _tag = 'NonError';
  }

  class CustomError extends Error {
    readonly _tag = 'CustomError';
  }

  it('should catch non-error object', async () => {
    builder.queryField('roll', t =>
      t.effect({
        // @ts-expect-error
        resolve() {
          return Effect.fail(new NonError());
        },
        type: ['Int'],
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.errors?.at(0)?.originalError).toBeInstanceOf(Error);
    expect(result.errors?.at(0)?.message).toContain('NonError');
  });

  it('should catch non-error object as custom error using failErrorConstructor', async () => {
    builder.queryField('roll', t =>
      t.effect({
        effect: {
          failErrorConstructor: CustomError,
        },
        // @ts-expect-error
        resolve() {
          return Effect.fail(new NonError());
        },
        type: ['Int'],
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.errors?.at(0)?.originalError).toBeInstanceOf(CustomError);
    expect(result.errors?.at(0)?.message).toContain('NonError');
  });

  it('should catch non-error object as custom error using defaultFailErrorConstructor', async () => {
    builder = new SchemaBuilder<SchemaTypes>({
      effectOptions: {
        defaultFailErrorConstructor: CustomError,
      },
      plugins: [EffectPlugin],
    });

    builder.queryType({});

    builder.queryField('roll', t =>
      t.effect({
        // @ts-expect-error
        resolve() {
          return Effect.fail(new NonError());
        },
        type: ['Int'],
      }));

    const schema = builder.toSchema();
    const document = parse(`{ roll }`);
    const result = await execute({ document, schema });

    expect(result.errors?.at(0)?.originalError).toBeInstanceOf(CustomError);
    expect(result.errors?.at(0)?.message).toContain('NonError');
  });
});
