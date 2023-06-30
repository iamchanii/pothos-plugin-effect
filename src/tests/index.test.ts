import * as Context from '@effect/data/Context';
import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import * as Layer from '@effect/io/Layer';
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
