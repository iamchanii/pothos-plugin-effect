import { MapperKind, mapSchema } from '@graphql-tools/utils';
import { Runtime } from 'effect';
import { GraphQLSchema } from 'graphql';
import { effectResolver } from './effectResolver.js';

export function enableExecuteEffect<R>(
  schema: GraphQLSchema,
  runtime: Runtime.Runtime<R> = Runtime.defaultRuntime as never,
) {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD](fieldConfig) {
      if (fieldConfig.resolve) {
        fieldConfig.resolve = effectResolver(fieldConfig.resolve, runtime);
      }

      if (fieldConfig.subscribe) {
        fieldConfig.subscribe = effectResolver(fieldConfig.subscribe, runtime);
      }

      return fieldConfig;
    },
  });
}
