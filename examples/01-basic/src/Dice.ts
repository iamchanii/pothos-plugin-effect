import { Context, Effect } from 'effect';

export interface Dice {
  roll(): Effect.Effect<never, never, number>;
}

export const Dice = Context.Tag<Dice>();
