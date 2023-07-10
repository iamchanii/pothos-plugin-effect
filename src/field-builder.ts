import * as Context from '@effect/data/Context';
import { pipe } from '@effect/data/Function';
import * as Option from '@effect/data/Option';
import * as Cause from '@effect/io/Cause';
import * as Effect from '@effect/io/Effect';
import * as Exit from '@effect/io/Exit';
import * as Layer from '@effect/io/Layer';
import { FieldKind, Resolver, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { GraphQLResolveInfo } from 'graphql';

const fieldBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
  SchemaTypes,
  unknown,
  FieldKind
>;
fieldBuilderProto.effect = function effect({ effect = {}, resolve, ...options }) {
  return this.field({
    ...options,
    resolve: (async (_parent: any, _args: any, _context: any, _info: GraphQLResolveInfo) => {
      const effectOptions = this.builder.options.effectOptions;

      const result = await pipe(
        Effect.Do,
        Effect.bind('context', () => {
          return pipe(
            getGlobalContextFromBuilderOptions(),
            Effect.flatMap(mergeProvidedContexts),
            Effect.flatMap(addProvidedServices),
          );
        }),
        Effect.bind('layer', () => {
          return pipe(
            getGlobalLayerFromBuilderOptions(),
            Effect.flatMap(provideLayers),
          );
        }),
        Effect.flatMap(({ context, layer }) => {
          return pipe(
            resolve(_parent, _args, _context, _info) as Effect.Effect<never, never, any>,
            Effect.provideLayer(layer),
            Effect.provideContext(context),
          );
        }),
        Effect.runPromiseExit,
      );

      if (Exit.isSuccess(result)) {
        if (!options.nullable) {
          return result.value;
        }

        if (Array.isArray(result.value)) {
          return result.value.map(Option.match({
            onNone: () => null,
            onSome: (value) => value,
          }));
        }

        if (Option.isOption(result.value)) {
          return Option.match(result.value, {
            onNone: () => null,
            onSome: (value) => {
              if (typeof options.nullable === 'object' && options.nullable.items && Array.isArray(value)) {
                return value.map(Option.match({
                  onNone: () => null,
                  onSome: (value) => value,
                }));
              }

              return value;
            },
          });
        }
      }

      if (Exit.isFailure(result) && Cause.isAnnotatedType(result.cause) && Cause.isFailType(result.cause.cause)) {
        throw result.cause.cause.error;
      }

      throw result as never;

      function getGlobalContextFromBuilderOptions(): Effect.Effect<never, never, Context.Context<any>> {
        return pipe(
          Effect.gen(function*(_) {
            if (typeof effectOptions?.globalContext === 'function') {
              return effectOptions?.globalContext(_context);
            }

            if (typeof effectOptions?.globalContext !== 'undefined') {
              return effectOptions?.globalContext;
            }

            return Context.empty() as Context.Context<any>;
          }),
        );
      }

      function mergeProvidedContexts(context: Context.Context<any>): Effect.Effect<never, never, Context.Context<any>> {
        return Effect.reduce(effect.contexts ?? [], context, (acc, context) => {
          return pipe(
            acc,
            Context.merge(typeof context === 'function' ? context(_context) : context),
            Effect.succeed,
          );
        });
      }

      function addProvidedServices(context: Context.Context<any>): Effect.Effect<never, never, Context.Context<any>> {
        return Effect.reduce(effect.services ?? [], context, (acc, [tag, service]) => {
          return pipe(
            acc,
            Context.add(tag, typeof service === 'function' ? service(_context) : service),
            Effect.succeed,
          );
        });
      }

      function getGlobalLayerFromBuilderOptions(): Effect.Effect<never, never, Layer.Layer<never, never, any>> {
        return pipe(
          Effect.gen(function*(_) {
            if (typeof effectOptions?.globalLayer === 'function') {
              return effectOptions?.globalLayer(_context);
            }

            if (typeof effectOptions?.globalLayer !== 'undefined') {
              return effectOptions?.globalLayer;
            }

            return Layer.context<any>() as Layer.Layer<never, never, any>;
          }),
        );
      }

      function provideLayers(
        layer: Layer.Layer<never, never, any>,
      ): Effect.Effect<never, never, Layer.Layer<never, never, any>> {
        return Effect.reduce(effect.layers ?? [], layer, (acc, layer) => {
          return pipe(
            acc,
            Layer.provide((typeof layer === 'function' ? layer(_context) : layer) as Layer.Layer<never, never, any>),
            Effect.succeed,
          );
        });
      }
    }) as Resolver<any, any, any, any>,
  });
};
