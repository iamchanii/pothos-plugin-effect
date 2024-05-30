import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Runtime } from 'effect';
import { executeEffect, executeStream } from 'effect-utils';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.executeEffect = function (effectFieldResult) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  return executeEffect(effectFieldResult, effectRuntime) as never;
};

fieldBuilderProto.executeStream = function (effectFieldResult) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  return executeStream(effectFieldResult, effectRuntime) as never;
};

fieldBuilderProto.effect = function (options) {
  return this.field({
    ...options,
    // @ts-ignore
    resolve: async (root, args, context, info) => {
      if ('resolve' in options) {
        const effectFieldResult = options.resolve(root, args, context, info);

        // @ts-ignore
        return this.executeEffect(effectFieldResult);
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

        // @ts-ignore
        return this.executeEffect(effectFieldResult);
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
