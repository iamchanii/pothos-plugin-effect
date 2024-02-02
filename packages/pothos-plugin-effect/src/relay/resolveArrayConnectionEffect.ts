import { resolveArrayConnection } from '@pothos/plugin-relay';
import { Effect } from 'effect';
import invariant from 'tiny-invariant';
import {
  InferNullableType,
  InferNullableTypeShape,
  handleNullableValue,
} from '../libs/handleNullableValue.js';

export const resolveArrayConnectionEffect =
  <R, E, A, Type extends InferNullableTypeShape<InferNullableType<A>>>(
    options: Parameters<typeof resolveArrayConnection<A>>[0],
  ) =>
  (effect: Effect.Effect<R, E, A>) => {
    return effect.pipe(
      Effect.map((data) => {
        const $data = handleNullableValue(data);
        invariant(Array.isArray($data), 'Expected an array.');

        return resolveArrayConnection<Type>(options, $data);
      }),
    );
  };
