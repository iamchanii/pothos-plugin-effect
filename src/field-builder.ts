import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { GraphQLError } from 'graphql';

const fieldBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
  SchemaTypes,
  unknown,
  FieldKind
>;

fieldBuilderProto.effect = function effect({ resolve, ...options }) {
  return this.field({
    ...options,
    resolve: (async (...args: [parent: any, args: any, context: any, info: any]) => {
      const result = await pipe(
        resolve(...args),
        Effect.runPromiseExit,
      );

      if (result._tag === 'Success') {
        return result.value;
      }

      throw new GraphQLError('Failure');
    }) as never,
  });
};
