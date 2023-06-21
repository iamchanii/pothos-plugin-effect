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

export const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});

builder.queryType({
  fields: t => ({
    ping: t.string({
      resolve: () => 'pong',
    }),
    pingEffect: t.effect({
      resolve: () => Effect.succeed('pong'),
      type: 'String',
    }),
    pingService: t.effect({
      provideServices: [
        [Random, () => Random.of({ next: () => Effect.succeed(Math.random()) })],
      ],
      resolve: () =>
        pipe(
          Random,
          Effect.flatMap(random => random.next()),
          Effect.flatMap(n => Effect.succeed(n > 0.5 ? 'lucky!' : 'not lucky...')),
        ),
      type: 'String',
    }),
  }),
});
