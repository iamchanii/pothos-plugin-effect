import { Context, Effect } from 'effect';

export interface Dice {
  readonly roll: () => Effect.Effect<never, never, number>;
}

export const Dice = Context.Tag<Dice>('Dice');
