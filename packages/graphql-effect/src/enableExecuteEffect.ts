import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { Effect, Runtime } from 'effect';
import { executeEffect } from 'effect-utils';
import { GraphQLSchema } from 'graphql';

export function enableExecuteEffect<R>(
  schema: GraphQLSchema,
  runtime: Runtime.Runtime<R> = Runtime.defaultRuntime as never,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD](fieldConfig) {
      const originalResolve = fieldConfig.resolve;

      fieldConfig.resolve = async (source, args, context, info) => {
        if (originalResolve) {
          const result = await originalResolve(source, args, context, info);

          if (Effect.isEffect(result)) {
            return executeEffect(result as never, runtime);
          }

          return result;
        }
      };

      return fieldConfig;
    },
  });
}
