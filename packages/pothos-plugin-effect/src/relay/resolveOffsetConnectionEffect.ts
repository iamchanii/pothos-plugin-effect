import {
  resolveArrayConnection,
  resolveOffsetConnection,
} from '@pothos/plugin-relay';
import { Context, Effect } from 'effect';
import invariant from 'tiny-invariant';
import {
  InferNullableType,
  handleNullableValue,
} from '../libs/handleNullableValue.js';
import { NoUnion } from './types.js';

export interface ResolveOffsetConnectionArgs {
  limit: number;
  offset: number;
}

export const OffsetConnectionArgs = Context.Tag<ResolveOffsetConnectionArgs>(
  'OffsetConnectionArgs',
);

export const resolveOffsetConnectionEffect =
  <R, E, A>(options: Parameters<typeof resolveOffsetConnection>[0]) =>
  (
    effect: Effect.Effect<R | ResolveOffsetConnectionArgs, E, A>,
  ): NoUnion<
    InferNullableType<A>,
    Effect.Effect<
      R,
      E,
      ReturnType<typeof resolveArrayConnection<InferNullableType<A>>>
    >,
    'Invalid Type: Expected non union type.'
  > => {
    let params: ResolveOffsetConnectionArgs | null = null;

    resolveOffsetConnection(options, ($params) => {
      params = $params;
      return [];
    });

    invariant(params, 'Expected params to be set.');

    // @ts-expect-error
    return effect.pipe(
      Effect.provide(Context.make(OffsetConnectionArgs, params)),
      Effect.flatMap((data) => {
        const $data = handleNullableValue(data);
        invariant(Array.isArray($data), 'Expected an array.');

        return Effect.promise(() =>
          resolveOffsetConnection(options, () => $data),
        );
      }),
    );
  };
