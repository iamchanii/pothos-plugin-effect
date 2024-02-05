import {
  ResolveCursorConnectionArgs,
  resolveArrayConnection,
  resolveCursorConnection,
} from '@pothos/plugin-relay';
import { Context, Effect, pipe } from 'effect';
import invariant from 'tiny-invariant';
import {
  InferNullableType,
  handleNullableValue,
} from '../libs/handleNullableValue.js';
import { NoUnion } from './types.js';

export const CursorConnectionArgs = Context.Tag<ResolveCursorConnectionArgs>(
  'CursorConnectionArgs',
);

export const resolveCursorConnectionEffect =
  <R, E, A, Type extends InferNullableType<A>>(
    options: Omit<Parameters<typeof resolveCursorConnection>[0], 'toCursor'> & {
      toCursor: (value: NonNullable<Type>) => string;
    },
  ) =>
  (
    effect: Effect.Effect<R | ResolveCursorConnectionArgs, E, A>,
  ): NoUnion<
    InferNullableType<A>,
    Effect.Effect<
      R,
      E,
      ReturnType<typeof resolveArrayConnection<InferNullableType<A>>>
    >,
    'Invalid Type: Expected non union type.'
  > => {
    let params: ResolveCursorConnectionArgs | null = null;

    resolveCursorConnection(
      // @ts-expect-error - Caused by the `toCursor` property
      options,
      ($params) => {
        params = $params;
        return [];
      },
    );

    invariant(params, 'Expected params to be set.');

    // @ts-expect-error
    return effect.pipe(
      Effect.provide(Context.make(CursorConnectionArgs, params)),
      Effect.flatMap((data) => {
        const $data = handleNullableValue(data);
        invariant(Array.isArray($data), 'Expected an array.');

        return Effect.promise(() =>
          resolveCursorConnection(options, () => $data),
        );
      }),
    );
  };
