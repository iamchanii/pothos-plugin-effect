import { Effect, Runtime } from 'effect';
import { executeEffect, executeStream, isStream } from 'effect-utils';
import type { GraphQLFieldResolver } from 'graphql';

export const effectResolver =
  (
    resolve: GraphQLFieldResolver<any, any>,
    runtime = Runtime.defaultRuntime,
  ): GraphQLFieldResolver<any, any> =>
  async (source, args, context, info) => {
    const result = await resolve(source, args, context, info);

    if (Effect.isEffect(result)) {
      // @ts-ignore
      return executeEffect(result, runtime);
    }

    if (isStream(result)) {
      // @ts-ignore
      return executeStream(result, runtime);
    }

    return result;
  };
