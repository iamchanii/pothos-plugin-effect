import * as Context from '@effect/data/Context';
import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import * as Layer from '@effect/io/Layer';
import { FieldKind, Resolver, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { GraphQLError, GraphQLResolveInfo } from 'graphql';

const fieldBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
  SchemaTypes,
  unknown,
  FieldKind
>;

fieldBuilderProto.effect = function effect({ effect = {}, resolve, ...options }) {
  return this.field({
    ...options,
    resolve: (async (_parent: any, _args: any, _context: any, _info: GraphQLResolveInfo) => {
      // TODO: Build services, layer from this.builder.options.
      let context = Context.empty();
      let layer = Layer.context<any>();

      if (effect.services) {
        for (const [tag, serviceOrServiceFunction] of effect.services) {
          context = Context.add(
            context,
            tag,
            typeof serviceOrServiceFunction === 'function'
              ? serviceOrServiceFunction(_context)
              : serviceOrServiceFunction,
          );
        }
      }

      if (effect.contexts) {
        for (const contextOrContextFunction of effect.contexts) {
          context = Context.merge(
            context,
            typeof contextOrContextFunction === 'function'
              ? contextOrContextFunction(_context)
              : contextOrContextFunction,
          );
        }
      }

      if (effect.layers) {
        for (const layerOrLayerFunction of effect.layers) {
          const nextLayer = typeof layerOrLayerFunction === 'function'
            ? layerOrLayerFunction(_context)
            : layerOrLayerFunction;

          layer = Layer.provide(layer, nextLayer) as Layer.Layer<any, never, any>;
        }
      }

      const program = pipe(
        resolve(_parent, _args, _context, _info) as Effect.Effect<never, never, any>,
        Effect.provideLayer(layer as Layer.Layer<never, never, any>),
        Effect.provideContext(context),
      );

      const result = await Effect.runPromiseExit(program);

      if (result._tag === 'Success') {
        return result.value;
      }

      throw new GraphQLError('Failure', {
        originalError: result.cause._tag === 'Die' ? result.cause.defect as Error : null,
      });
    }) as Resolver<any, any, any, any>,
  });
};
