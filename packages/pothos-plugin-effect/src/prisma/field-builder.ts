import { FieldKind, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import { Runtime } from 'effect';
import { runEffectFieldResult } from '../core/runEffectFieldResult.js';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.prismaEffect = function effectConnection({
  resolve,
  ...fieldOptions
}) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  return this.prismaField({
    ...fieldOptions,
    resolve(query: any, parent: any, args: any, context: any, info: any) {
      const prismaEffectFieldResult = resolve(
        query,
        parent,
        args,
        context,
        info,
      );

      return runEffectFieldResult(
        prismaEffectFieldResult,
        effectRuntime,
      ) as never;
    },
  });
};
