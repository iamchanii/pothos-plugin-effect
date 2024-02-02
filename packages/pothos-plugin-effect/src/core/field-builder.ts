import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Runtime } from 'effect';
import { runEffectFieldResult } from './runEffectFieldResult.js';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.effect = function effect({ resolve, ...options }) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  return this.field({
    ...options,
    resolve(parent: any, args: any, context: any, info: any) {
      const effectFieldResult = resolve(parent, args, context, info);

      return runEffectFieldResult(effectFieldResult, effectRuntime) as never;
    },
  });
};
