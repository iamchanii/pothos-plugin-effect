import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Runtime } from 'effect';
import { runEffectFieldResult } from '../core/runEffectFieldResult.js';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.effectConnection = function effectConnection(
  { resolve, ...fieldOptions },
  connectionOptionsOrRef = {} as never,
  edgeOptionsOrRef = {} as never,
) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  return this.connection(
    {
      ...fieldOptions,
      resolve(parent, args, context, info) {
        const effectConnectionFieldResult = resolve(
          parent,
          args,
          context,
          info,
        );

        return runEffectFieldResult(
          effectConnectionFieldResult,
          effectRuntime,
        ) as never;
      },
    },
    connectionOptionsOrRef as never,
    edgeOptionsOrRef as never,
  ) as never;
};
