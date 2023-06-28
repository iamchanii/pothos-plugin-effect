import * as Context from '@effect/data/Context';
import * as Effect from '@effect/io/Effect';

export interface Dice {
  readonly roll: () => Effect.Effect<never, never, number>;
}

export const Dice = Context.Tag<Dice>();

export interface Notification {
  readonly notify: (message: string) => Effect.Effect<never, never, void>;
}

export const Notification = Context.Tag<Notification>();
