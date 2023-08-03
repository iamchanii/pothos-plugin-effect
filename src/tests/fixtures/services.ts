import { Context, Effect } from 'effect';

export interface Dice {
  readonly roll: () => Effect.Effect<never, never, number>;
}

export const Dice = Context.Tag<Dice>();

export interface Notification {
  readonly notify: (message: string) => Effect.Effect<never, never, void>;
}

export const Notification = Context.Tag<Notification>();
