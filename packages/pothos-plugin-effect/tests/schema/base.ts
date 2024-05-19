import { Effect, Random } from 'effect';
import { builder } from './builder.js';

builder.queryFields((t) => ({
  int: t.effect({
    type: 'Int',
    resolve: () => Effect.succeed(1),
  }),
  intList: t.effect({
    type: ['Int'],
    resolve: () => Effect.succeed([1, 2, 3]),
  }),
  string: t.effect({
    type: 'String',
    resolve: () => Effect.succeed('hello'),
  }),
  stringList: t.effect({
    type: ['String'],
    resolve: () => Effect.succeed(['hello', 'world']),
  }),
  float: t.effect({
    type: 'Float',
    resolve: () => Effect.succeed(1.5),
  }),
  floatList: t.effect({
    type: ['Float'],
    resolve: () => Effect.succeed([1.5, 2.5, 3.5]),
  }),
  boolean: t.effect({
    type: 'Boolean',
    resolve: () => Effect.succeed(true),
  }),
  booleanList: t.effect({
    type: ['Boolean'],
    resolve: () => Effect.succeed([true, false]),
  }),
  id: t.effect({
    type: 'ID',
    resolve: () => Effect.succeed('1'),
  }),
  idList: t.effect({
    type: ['ID'],
    resolve: () => Effect.succeed(['1', '2', '3']),
  }),
  roll: t.effect({
    type: 'Int',
    resolve: () => Random.nextIntBetween(1, 6),
  }),
}));
