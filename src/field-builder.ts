import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { GraphQLError } from 'graphql';

const fieldBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
  SchemaTypes,
  unknown,
  FieldKind
>;

fieldBuilderProto.effect = function effect({ provideServices, resolve, ...options }) {
  return this.field({
    ...options,
    resolve: (async (...[parent, args, context, info]: [parent: any, args: any, context: any, info: any]) => {
      let s = [];

      if (provideServices) {
        console.log(provideServices);

        s = provideServices.map(([tag, fn]) => {
          return Effect.provideService(tag, fn(context));
        });
      }

      const result = await pipe(
        resolve(parent, args, context, info),
        ...s as any,
        Effect.runPromiseExit,
      );

      if (result._tag === 'Success') {
        return result.value;
      }

      console.log(result);

      throw new GraphQLError('Failure');
    }) as never,
  });
};
