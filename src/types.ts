/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  EmptyToOptional,
  FieldKind,
  FieldNullability,
  FieldOptionsFromKind,
  InputFieldMap,
  InputShapeFromFields,
  ListResolveValue,
  MaybePromise,
  OutputShape,
  OutputType,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
  typeBrandKey,
} from '@pothos/core';
import type { Context as EffectContext, Layer as EffectLayer, Option as EffectOption } from 'effect';
import type { GraphQLResolveInfo } from 'graphql';
import type { IsEqual, IsNever, NotAnyType } from 'type-plus';

import { Effect } from 'effect';

type WithContext<T> = ((context: any) => T) | T;

type UnboxWithContext<T> = T extends (context: any) => infer U ? U : T;

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Infer {
  export type Tag<T> = T extends EffectContext.Tag<infer U, any> ? U : never;
  export type Context<T> = T extends EffectContext.Context<infer U> ? U : never;
  export type Layer<T> = T extends EffectLayer.Layer<any, any, infer U> ? U : never;
}

export type ServiceEntry = [
  tag: EffectContext.Tag<any, any>,
  service: ((context: any) => any) | any,
];

export type Context = WithContext<EffectContext.Context<any>>;

export type Layer = WithContext<EffectLayer.Layer<any, any, any>>;

type GetEffectRequirementsFromServiceEntries<
  ServiceEntries extends readonly [...ServiceEntry[]],
> = NotAnyType<
  keyof { [K in ServiceEntries[number][0] as Infer.Tag<K>]: true }
>;

type GetEffectRequirementsFromContexts<
  Contexts extends readonly [...Context[]],
> = NotAnyType<
  keyof { [K in Contexts[number] as Infer.Context<UnboxWithContext<K>>]: true }
>;

type GetEffectRequirementsFromLayers<
  Layers extends readonly [...Layer[]],
> = NotAnyType<
  keyof { [K in Layers[number] as Infer.Layer<UnboxWithContext<K>>]: true }
>;

type GetEffectRequirements<
  Types extends SchemaTypes,
  ServiceEntries extends readonly [...ServiceEntry[]],
  Contexts extends readonly [...Context[]],
  Layers extends readonly [...Layer[]],
> =
  | GetEffectRequirementsFromContexts<Contexts>
  | GetEffectRequirementsFromLayers<Layers>
  | GetEffectRequirementsFromServiceEntries<ServiceEntries>
  | Infer.Context<Types['EffectGlobalContext']>
  | Infer.Layer<Types['EffectGlobalLayer']>;

type GetEffectErrors<Errors extends readonly [...any[]]> = 'errors' extends PluginName
  ? NotAnyType<keyof { [K in Errors[number] as InstanceType<K>]: true }>
  : never;

type GetEffectOutputShape<Type, Nullable> = IsEqual<Nullable, true> extends true ? EffectOption.Option<Type>
  : IsEqual<Nullable, { items: true; list: false }> extends true ? EffectOption.Option<Type>[]
  : IsEqual<Nullable, { items: false; list: true }> extends true ? EffectOption.Option<Type[]>
  : IsEqual<Nullable, { items: true; list: true }> extends true ? EffectOption.Option<EffectOption.Option<Type>[]>
  : Type;

export type FieldEffectOptions<
  ServiceEntriesShape extends readonly [...ServiceEntry[]],
  ContextsShape extends readonly [...Context[]],
  LayersShape extends readonly [...Layer[]],
> = {
  contexts?: ContextsShape;
  layers?: LayersShape;
  services?: ServiceEntriesShape;
  failErrorConstructor?: { new(...args: any[]): unknown };
};

export type FieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Args extends InputFieldMap,
  Nullable extends FieldNullability<Type>,
  ResolveReturnShape,
  // Effect Types:
  ServiceEntriesShape extends readonly [...ServiceEntry[]],
  ContextsShape extends readonly [...Context[]],
  LayersShape extends readonly [...Layer[]],
  ErrorsShape extends readonly [...any[]],
  // Pothos Types:
  Kind extends FieldKind = FieldKind,
> =
  & Omit<
    FieldOptionsFromKind<
      Types,
      ParentShape,
      Type,
      Nullable,
      Args,
      Kind,
      ParentShape,
      ResolveReturnShape
    >,
    'resolve'
  >
  & {
    effect?: FieldEffectOptions<ServiceEntriesShape, ContextsShape, LayersShape>;
    errors?: 'errors' extends PluginName ? { types?: ErrorsShape } : never;
    resolve(
      parent: ParentShape,
      args: InputShapeFromFields<Args>,
      context: Types['Context'],
      info: GraphQLResolveInfo,
    ): Effect.Effect<
      GetEffectRequirements<
        Types,
        ServiceEntriesShape,
        ContextsShape,
        LayersShape
      >,
      GetEffectErrors<ErrorsShape>,
      GetEffectOutputShape<
        OutputShape<Types, [Type] extends [null | readonly (infer Item)[] | undefined] ? Item : Type>,
        Nullable
      >
    >;
  };

export type ConnectionFieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Type extends OutputType<Types>,
  Args extends InputFieldMap,
  Nullable extends boolean,
  ResolveReturnShape,
  // Effect Types:
  ServiceEntriesShape extends readonly [...ServiceEntry[]],
  ContextsShape extends readonly [...Context[]],
  LayersShape extends readonly [...Layer[]],
  ErrorsShape extends readonly [...any[]],
  // Pothos Types:
  Kind extends FieldKind = FieldKind,
> =
  & Omit<
    FieldOptions<
      Types,
      ParentShape,
      Type,
      Args,
      Nullable,
      ResolveReturnShape,
      ServiceEntriesShape,
      ContextsShape,
      LayersShape,
      ErrorsShape,
      Kind
    >,
    'args' | 'resolve' | 'type'
  >
  & Omit<
    PothosSchemaTypes.ConnectionFieldOptions<
      Types,
      ParentShape,
      Type,
      Nullable,
      false,
      false,
      Args,
      ResolveReturnShape
    >,
    'resolve'
  >
  & (
    & InputShapeFromFields<Args>
    & PothosSchemaTypes.DefaultConnectionArguments extends infer ConnectionArgs ? {
        resolve(
          parent: ParentShape,
          args: ConnectionArgs,
          context: Types['Context'],
          info: GraphQLResolveInfo,
        ): Effect.Effect<
          GetEffectRequirements<
            Types,
            ServiceEntriesShape,
            ContextsShape,
            LayersShape
          >,
          GetEffectErrors<ErrorsShape>,
          ShapeFromConnection<
            PothosSchemaTypes.ConnectionShapeHelper<Types, ShapeFromTypeParam<Types, Type, false>, Nullable>
          >
        >;
        type: Type;
      }
      : never
  );

export type ShapeFromConnection<T> = T extends { shape: unknown } ? T['shape'] : never;

export type PluginOptions<Types extends SchemaTypes> = EmptyToOptional<
  & { defaultFailErrorConstructor?: { new(...args: any[]): unknown } }
  & IsNever<
    Infer.Context<Types['EffectGlobalContext']>,
    { globalContext?: never },
    { globalContext: Types['EffectGlobalContext'] }
  >
  & IsNever<
    Infer.Layer<Types['EffectGlobalLayer']>,
    { globalLayer?: never },
    { globalLayer: Types['EffectGlobalLayer'] }
  >
>;

export type PrismaRef<Model extends import('@pothos/plugin-prisma').PrismaModelTypes, T = {}> =
  | import('@pothos/plugin-prisma').PrismaInterfaceRef<Model, T>
  | import('@pothos/plugin-prisma').PrismaObjectRef<Model, T>;

export interface PrismaModelTypes {
  Name: string;
  Shape: {};
  Include: unknown;
  Select: unknown;
  OrderBy: unknown;
  Where: {};
  WhereUnique: {};
  Create: {};
  Update: {};
  ListRelations: string;
  RelationName: string;
  Relations: Record<
    string,
    {
      Shape: unknown;
      Name: string;
      // Types: PrismaModelTypes;
    }
  >;
}

export type WithBrand<T> = T & { [typeBrandKey]: string };

export type PrismaFieldResolver<
  Types extends SchemaTypes,
  Model extends PrismaModelTypes,
  Parent,
  Param extends TypeParam<Types>,
  Args extends InputFieldMap,
  Nullable extends FieldNullability<Param>,
  ResolveReturnShape,
  // Effect Types:
  ServiceEntriesShape extends readonly [...ServiceEntry[]],
  ContextsShape extends readonly [...Context[]],
  LayersShape extends readonly [...Layer[]],
  ErrorsShape extends readonly [...any[]],
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
  GetEffectRequirements<
    Types,
    ServiceEntriesShape,
    ContextsShape,
    LayersShape
  >,
  GetEffectErrors<ErrorsShape>,
  ShapeFromTypeParam<Types, Param, Nullable> extends infer Shape
    ? [Shape] extends [[readonly (infer Item)[] | null | undefined]] ? ListResolveValue<Shape, Item, ResolveReturnShape>
    : MaybePromise<Shape>
    : never
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
  ServiceEntriesShape extends readonly [...ServiceEntry[]],
  ContextsShape extends readonly [...Context[]],
  LayersShape extends readonly [...Layer[]],
  ErrorsShape extends readonly [...any[]],
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
> extends infer FieldOptions ? Omit<FieldOptions, 'resolve' | 'type'> & {
    type: Type;
    effect?: FieldEffectOptions<ServiceEntriesShape, ContextsShape, LayersShape>;
    errors?: 'errors' extends PluginName ? { types?: ErrorsShape } : never;
    resolve: FieldOptions extends { resolve?: (parent: infer Parent, ...args: any[]) => unknown } ? PrismaFieldResolver<
        Types,
        Model,
        Parent,
        Param,
        Args,
        Nullable,
        ResolveReturnShape,
        ServiceEntriesShape,
        ContextsShape,
        LayersShape,
        ErrorsShape
      >
      : PrismaFieldResolver<
        Types,
        Model,
        ParentShape,
        Param,
        Args,
        Nullable,
        ResolveReturnShape,
        ServiceEntriesShape,
        ContextsShape,
        LayersShape,
        ErrorsShape
      >;
  }
  : never;
