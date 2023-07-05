import * as Context from '@effect/data/Context';
import * as Effect from '@effect/io/Effect';

export interface Dice {
  roll(): Effect.Effect<never, never, number>;
}

export const Dice = Context.Tag<Dice>();
