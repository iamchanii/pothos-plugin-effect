import {
  ResolveCursorConnectionArgs as PothosResolveCursorConnectionArgs,
  resolveCursorConnection,
} from '@pothos/plugin-relay';
import { Context, Effect } from 'effect';
import invariant from 'tiny-invariant';
import {
  InferNullableType,
  InferNullableTypeShape,
  handleNullableValue,
} from '../libs/handleNullableValue.js';

export const ResolveCursorConnectionArgs =
  Context.Tag<PothosResolveCursorConnectionArgs>('ResolveCursorConnectionArgs');

export const resolveCursorConnectionEffect =
  <R, E, A, Type extends InferNullableTypeShape<InferNullableType<A>>>(
    options: Omit<Parameters<typeof resolveCursorConnection>[0], 'toCursor'> & {
      toCursor: (value: Type) => string;
    },
  ) =>
  (effect: Effect.Effect<R | PothosResolveCursorConnectionArgs, E, A>) => {
    let params: PothosResolveCursorConnectionArgs | null = null;

    resolveCursorConnection(
      // @ts-expect-error - Caused by the `toCursor` property
      options,
      ($params) => {
        params = $params;
        return [];
      },
    );

    invariant(params, 'Expected params to be set.');

    return effect.pipe(
      Effect.provide(Context.make(ResolveCursorConnectionArgs, params)),
      Effect.flatMap((data) => {
        const $data = handleNullableValue(data);
        invariant(Array.isArray($data), 'Expected an array.');

        return Effect.promise(() =>
          resolveCursorConnection(options, () => $data),
        );
      }),
    );
  };
