import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Runtime } from 'effect';
import { executeEffect } from 'effect-utils';

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

fieldBuilderProto.effect = function ({
  resolve: effectFieldResolve,
  ...options
}) {
  return this.field({
    ...options,
    // @ts-ignore
    resolve: async (root, args, context, info) => {
      const effectFieldResult = effectFieldResolve(root, args, context, info);

      // @ts-ignore
      return this.executeEffect(effectFieldResult);
    },
  });
};
