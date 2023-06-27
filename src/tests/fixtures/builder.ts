import * as Context from '@effect/data/Context';
import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import SchemaBuilder from '@pothos/core';

import EffectPlugin from '../../index.ts';

interface Random {
  readonly next: () => Effect.Effect<never, never, number>;
}

const Random = Context.Tag<Random>();

interface Foo {
  readonly bar: () => Effect.Effect<never, never, string>;
}

const Foo = Context.Tag<Foo>();

export const builder = new SchemaBuilder<{
  Context: {
    randomValue: number;
  };
}>({
  plugins: [EffectPlugin],
});

const fooContext = Context.add(Context.empty(), Foo, { bar: () => Effect.succeed('bar!') });

builder.queryType({
  fields: t => ({
    ping: t.string({
      resolve: () => 'pong',
    }),
    ping2: t.effect({
      resolve: () => Effect.succeed('pong'),
      type: 'String',
    }),
    ping3: t.effect({
      effect: {
        contexts: () => [
          pipe(
            Context.empty(),
            Context.add(Foo, Foo.of({ bar: () => Effect.succeed('bar') })),
            // Context.add(Random, Random.of({ next: () => Effect.succeed(1) })),
          ),
          // pipe(
          //   Context.empty(),
          //   // Context.add(Foo, Foo.of({ bar: () => Effect.succeed('bar') })),
          //   Context.add(Random, Random.of({ next: () => Effect.succeed(1) })),
          // ),
        ],
        services: () => [
          [Random, Random.of({ next: () => Effect.succeed(0.5) })],
        ],
      },
      resolve: () =>
        pipe(
          Effect.all(Random, Foo),
          Effect.flatMap(([random]) => random.next()),
          Effect.map(String),
          // Effect.succeed('pong'),
        ),
      type: 'String',
    }),
    // ping3: t.effect({
    //   effect: {
    //     services: (context) => [
    //       [Random, Random.of({ next: () => Effect.succeed(context.randomValue) })],
    //     ],
    //   },
    //   resolve: () =>
    //     pipe(
    //       Random,
    //       Effect.flatMap(random => random.next()),
    //       Effect.flatMap(n => Effect.succeed(n > 0.5 ? 'lucky!' : 'not lucky...')),
    //     ),
    //   type: 'String',
    // }),
    // ping4: t.effect({
    //   effect: {
    //     context: () => fooContext,
    //   },
    //   resolve: () =>
    //     pipe(
    //       Foo,
    //       Effect.flatMap(foo => foo.bar()),
    //       Effect.map(bar => `bar from context: ${bar}`),
    //     ),
    //   type: 'String',
    // }),
  }),
});
