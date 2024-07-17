import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Effect, Runtime } from 'effect';
import { executeEffect, executeStream, isStream } from 'effect-utils';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.executeEffect = function (effectFieldResult) {
  const effectRuntime =
    this.builder.options.effect?.effectRuntime ?? Runtime.defaultRuntime;

  return executeEffect(effectFieldResult, effectRuntime) as never;
};

fieldBuilderProto.executeStream = function (effectFieldResult) {
  const effectRuntime =
    this.builder.options.effect?.effectRuntime ?? Runtime.defaultRuntime;

  return executeStream(effectFieldResult, effectRuntime) as never;
};

fieldBuilderProto.effect = function (options) {
  return this.field({
    ...options,
    // @ts-ignore
    resolve: async (root, args, context, info) => {
      if ('resolve' in options) {
        const effectFieldResult = options.resolve(root, args, context, info);

        if (Effect.isEffect(effectFieldResult)) {
          return this.executeEffect(effectFieldResult);
        }

        if (isStream(effectFieldResult)) {
          return this.executeStream(effectFieldResult);
        }
      }
    },
    // @ts-ignore
    subscribe: async (root, args, context, info) => {
      if ('subscribe' in options && typeof options.subscribe === 'function') {
        const effectFieldResult = options.subscribe(root, args, context, info);

        return this.executeStream(effectFieldResult);
      }
    },
  });
};

// @ts-ignore
fieldBuilderProto.effectWithInput = function (options) {
  // @ts-ignore
  return this.fieldWithInput({
    ...options,
    // @ts-ignore
    resolve: async (root, args, context, info) => {
      if ('resolve' in options) {
        const effectFieldResult = options.resolve(root, args, context, info);

        if (Effect.isEffect(effectFieldResult)) {
          // @ts-ignore
          return this.executeEffect(effectFieldResult);
        }

        if (isStream(effectFieldResult)) {
          // @ts-ignore
          return this.executeStream(effectFieldResult);
        }
      }
    },
    // @ts-ignore
    subscribe: async (root, args, context, info) => {
      if ('subscribe' in options && typeof options.subscribe === 'function') {
        const effectFieldResult = options.subscribe(root, args, context, info);

        return this.executeStream(effectFieldResult);
      }
    },
  });
};
