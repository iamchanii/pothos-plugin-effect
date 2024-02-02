import { resolveOffsetConnection } from '@pothos/plugin-relay';
import { Context, Effect } from 'effect';
import invariant from 'tiny-invariant';
import { handleNullableValue } from '../libs/handleNullableValue.js';

export interface ResolveOffsetConnectionArgs {
  limit: number;
  offset: number;
}

export const ResolveOffsetConnectionArgs =
  Context.Tag<ResolveOffsetConnectionArgs>('ResolveOffsetConnectionArgs');

export const resolveOffsetConnectionEffect =
  <R, E, A>(options: Parameters<typeof resolveOffsetConnection>[0]) =>
  (effect: Effect.Effect<R | ResolveOffsetConnectionArgs, E, A>) => {
    let params: ResolveOffsetConnectionArgs | null = null;

    resolveOffsetConnection(options, ($params) => {
      params = $params;
      return [];
    });

    invariant(params, 'Expected params to be set.');

    return effect.pipe(
      Effect.provide(Context.make(ResolveOffsetConnectionArgs, params)),
      Effect.flatMap((data) => {
        const $data = handleNullableValue(data);
        invariant(Array.isArray($data), 'Expected an array.');

        return Effect.promise(() =>
          resolveOffsetConnection(options, () => $data),
        );
      }),
    );
  };
