import type {
  FieldKind,
  FieldNullability,
  InputFieldMap,
  InputShapeFromFields,
  OutputShape,
  OutputType,
  SchemaTypes,
} from '@pothos/core';
import { Effect } from 'effect';
import type { GraphQLResolveInfo } from 'graphql';
import {
  ErrorConstructor,
  FieldOptions,
  InferError,
  InferRequirements,
} from '../core/index.js';

export type InferSucceedValue<
  Types extends SchemaTypes,
  Shape,
  Nullable extends boolean,
> = ShapeFromConnection<
  PothosSchemaTypes.ConnectionShapeHelper<Types, Shape, Nullable>
>;

export type ConnectionFieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Args extends InputFieldMap,
  Type extends OutputType<Types>,
  Nullable extends boolean,
  ResolveReturnShape,
  // Effect Types:
  ErrorTypes extends [...ErrorConstructor[]],
  // Pothos Types:
  Kind extends FieldKind = FieldKind,
  EdgeNullability extends FieldNullability<
    [unknown]
  > = Types['DefaultEdgesNullability'],
  NodeNullability extends boolean = Types['DefaultNodeNullability'],
> = Omit<
  FieldOptions<
    Types,
    ParentShape,
    Args,
    Type,
    Nullable,
    ResolveReturnShape,
    ErrorTypes,
    Kind
  >,
  'args' | 'resolve' | 'type'
> &
  Omit<
    PothosSchemaTypes.ConnectionFieldOptions<
      Types,
      ParentShape,
      Type,
      Nullable,
      EdgeNullability,
      NodeNullability,
      Args,
      ResolveReturnShape
    >,
    'resolve'
  > &
  (InputShapeFromFields<Args> &
    PothosSchemaTypes.DefaultConnectionArguments extends infer ConnectionArgs
    ? {
        resolve(
          parent: ParentShape,
          args: ConnectionArgs,
          context: Types['Context'],
          info: GraphQLResolveInfo,
        ): Effect.Effect<
          InferRequirements<Types['EffectRuntime']>,
          InferError<ErrorTypes>,
          InferSucceedValue<
            Types,
            OutputShape<
              Types,
              [Type] extends [null | readonly (infer Item)[] | undefined]
                ? Item
                : Type
            >,
            Nullable
          >

          // InferSucceedValue<
          //   ShapeFromConnection<
          //     PothosSchemaTypes.ConnectionShapeHelper<
          //       Types,
          //       ShapeFromTypeParam<Types, Type, false>,
          //       Nullable
          //     >
          //   >,
          //   Nullable,
          //   false
          // >
        >;
        type: Type;
      }
    : never);

export type ShapeFromConnection<T> = T extends { shape: unknown }
  ? T['shape']
  : never;
