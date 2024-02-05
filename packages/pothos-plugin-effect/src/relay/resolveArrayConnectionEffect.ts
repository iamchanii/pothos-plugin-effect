import { resolveArrayConnection } from '@pothos/plugin-relay';
import { Effect } from 'effect';
import invariant from 'tiny-invariant';
import {
  InferNullableType,
  handleNullableValue,
} from '../libs/handleNullableValue.js';
import { NoUnion } from './types.js';

export const resolveArrayConnectionEffect =
  <R, E, A>(options: Parameters<typeof resolveArrayConnection<A>>[0]) =>
  (
    effect: Effect.Effect<R, E, A>,
  ): NoUnion<
    InferNullableType<A>,
    Effect.Effect<
      R,
      E,
      ReturnType<typeof resolveArrayConnection<InferNullableType<A>>>
    >,
    'Invalid Type: Expected non union type.'
  > => {
    return effect.pipe(
      Effect.map((data) => {
        const $data = handleNullableValue(data);
        invariant(Array.isArray($data), 'Expected an array.');

        return resolveArrayConnection(options, $data);
      }),
    ) as any;
  };
