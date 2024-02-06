import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Runtime } from 'effect';
import { runEffectFieldResult } from './runEffectFieldResult.js';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.effect = function effect(effectFieldResult) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  return runEffectFieldResult(effectFieldResult, effectRuntime) as never;
};
