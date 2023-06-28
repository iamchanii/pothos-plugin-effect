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
            Context.add(Random, Random.of({ next: () => Effect.succeed(1) })),
          ),
        ],
      },
      resolve: () =>
        pipe(
          Effect.all(Random, Foo),
          Effect.flatMap(([random]) => random.next()),
          Effect.map(String),
        ),
      type: 'String',
    }),
  }),
});
