import { Effect, Stream } from 'effect';
import { builder } from './builder.js';

builder.subscriptionFields((t) => ({
  newPosts: t.effect({
    type: 'ID',
    subscribe: () => Stream.range(1, 10),
    resolve: (value) => Effect.succeed(value),
  }),
}));
