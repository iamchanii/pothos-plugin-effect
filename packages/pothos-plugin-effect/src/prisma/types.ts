import type {
  FieldKind,
  FieldNullability,
  FieldOptionsFromKind,
  InputFieldMap,
  InputShapeFromFields,
  ListResolveValue,
  MaybePromise,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import {
  PrismaInterfaceRef,
  PrismaModelTypes,
  PrismaObjectRef,
} from '@pothos/plugin-prisma';
import {
  ErrorConstructor,
  InferError,
  InferRequirements,
  InferSucceedValue,
} from '../core/index.js';
import { GraphQLResolveInfo } from 'graphql';
import { Effect } from 'effect';

export type PrismaRef<Model extends PrismaModelTypes, T = {}> =
  | PrismaInterfaceRef<Model, T>
  | PrismaObjectRef<Model, T>;

export type PrismaFieldResolver<
  Types extends SchemaTypes,
  Model extends PrismaModelTypes,
  Parent,
  Param extends TypeParam<Types>,
  Args extends InputFieldMap,
  Nullable extends FieldNullability<Param>,
  ResolveReturnShape,
  // Effect Types:
  ErrorTypes extends [...ErrorConstructor[]],
> = (
  query: {
    include?: Model['Include'];
    select?: Model['Select'];
  },
  parent: Parent,
  args: InputShapeFromFields<Args>,
  context: Types['Context'],
  info: GraphQLResolveInfo,
) => Effect.Effect<
  InferRequirements<Types['EffectRuntime']>,
  InferError<ErrorTypes>,
  InferSucceedValue<
    ShapeFromTypeParam<Types, Param, Nullable> extends infer Shape
      ? [Shape] extends [[readonly (infer Item)[] | null | undefined]]
        ? ListResolveValue<Shape, Item, ResolveReturnShape>
        : MaybePromise<Shape>
      : never,
    Nullable,
    false
  >
>;

export type PrismaFieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Type extends
    | PrismaRef<PrismaModelTypes>
    | keyof Types['PrismaTypes']
    | [keyof Types['PrismaTypes']]
    | [PrismaRef<PrismaModelTypes>],
  Model extends PrismaModelTypes,
  Param extends TypeParam<Types>,
  Args extends InputFieldMap,
  Nullable extends FieldNullability<Param>,
  ResolveShape,
  ResolveReturnShape,
  // Effect Types:
  ErrorTypes extends [...ErrorConstructor[]],
  // Pothos Types:
  Kind extends FieldKind = FieldKind,
> = FieldOptionsFromKind<
  Types,
  ParentShape,
  Param,
  Nullable,
  Args,
  Kind,
  ResolveShape,
  ResolveReturnShape
> extends infer FieldOptions
  ? Omit<FieldOptions, 'resolve' | 'type'> & {
      type: Type;
      errors?: 'errors' extends PluginName ? { types?: ErrorTypes } : never;
      resolve: FieldOptions extends {
        resolve?: (parent: infer Parent, ...args: any[]) => unknown;
      }
        ? PrismaFieldResolver<
            Types,
            Model,
            Parent,
            Param,
            Args,
            Nullable,
            ResolveReturnShape,
            ErrorTypes
          >
        : PrismaFieldResolver<
            Types,
            Model,
            ParentShape,
            Param,
            Args,
            Nullable,
            ResolveReturnShape,
            ErrorTypes
          >;
    }
  : never;
