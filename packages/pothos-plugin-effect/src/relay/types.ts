import type {
  FieldKind,
  FieldNullability,
  InputFieldMap,
  InputShapeFromFields,
  OutputType,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
  UnionToIntersection,
} from '@pothos/core';
import { ConnectionShape } from '@pothos/plugin-relay';
import { Effect } from 'effect';
import type { GraphQLResolveInfo } from 'graphql';
import {
  ErrorConstructor,
  FieldOptions,
  InferError,
  InferRequirements,
} from '../core/index.js';

export type NoUnion<T, TResult, TError> = [Extract<T, null>] extends [
  UnionToIntersection<Extract<T, null>>,
]
  ? TResult
  : TError;

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
          ConnectionShape<
            Types,
            ShapeFromTypeParam<Types, Type, Nullable>,
            Nullable,
            EdgeNullability,
            NodeNullability
          >
        >;
        type: Type;
        errors?: 'errors' extends PluginName
          ? { types?: ErrorConstructor }
          : never;
      }
    : never);

export type ShapeFromConnection<T> = T extends { shape: unknown }
  ? T['shape']
  : never;
