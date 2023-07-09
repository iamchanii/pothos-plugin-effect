/* eslint-disable @typescript-eslint/no-explicit-any */

import type * as EffectContext from '@effect/data/Context';
import type * as EffectOption from '@effect/data/Option';
import type * as EffectLayer from '@effect/io/Layer';
import type {
  EmptyToOptional,
  FieldKind,
  FieldNullability,
  FieldOptionsFromKind,
  InputFieldMap,
  InputShapeFromFields,
  OutputShape,
  PluginName,
  SchemaTypes,
  TypeParam,
} from '@pothos/core';
import type { GraphQLResolveInfo } from 'graphql';
import type { NotAnyType } from 'type-plus';

import * as Effect from '@effect/io/Effect';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Infer {
  export type Tag<T> = T extends EffectContext.Tag<any, any> ? EffectContext.Tag.Identifier<T> : never;

  export type Context<T> = T extends (...args: any[]) => EffectContext.Context<infer U> ? U
    : T extends EffectContext.Context<infer U> ? U
    : never;

  export type Layer<T> = T extends (...args: any[]) => EffectLayer.Layer<any, any, infer U> ? U
    : T extends EffectLayer.Layer<any, any, infer U> ? U
    : never;
}

export type ServiceEntry = [
  tag: EffectContext.Tag<any, any>,
  service: ((context: any) => any) | any,
];

export type Context = ((context: any) => EffectContext.Context<any>) | EffectContext.Context<any>;

export type Layer = ((context: any) => EffectLayer.Layer<any, any, any>) | EffectLayer.Layer<any, any, any>;

type GetEffectRequirementsFromServiceEntries<
  ServiceEntries extends readonly [...ServiceEntry[]],
> = NotAnyType<
  keyof { [K in ServiceEntries[number][0] as Infer.Tag<K>]: true }
>;

type GetEffectRequirementsFromContexts<
  Contexts extends readonly [...Context[]],
> = NotAnyType<
  keyof { [K in Contexts[number] as Infer.Context<K>]: true }
>;

type GetEffectRequirementsFromLayers<
  Layers extends readonly [...Layer[]],
> = NotAnyType<
  keyof { [K in Layers[number] as Infer.Layer<K>]: true }
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

type GetEffectOutputShape<Type, Nullable> = Nullable extends true ? EffectOption.Option<Type>
  : Nullable extends { items: true; list: false } ? EffectOption.Option<Type>[]
  : Nullable extends { items: false; list: true } ? EffectOption.Option<Type[]>
  : Nullable extends { items: true; list: true } ? EffectOption.Option<EffectOption.Option<Type>[]>
  : Type;

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
    effect?: {
      contexts?: ContextsShape;
      failErrorConstructor?: { new(message: string): unknown };
      layers?: LayersShape;
      services?: ServiceEntriesShape;
    };
    errors?: 'errors' extends PluginName ? { types: ErrorsShape } : never;
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

export type PluginOptions<Types extends SchemaTypes> = EmptyToOptional<{
  failErrorConstructor?: { new(message: string): unknown };
  globalContext?: ((conext: Types['Context']) => Types['EffectGlobalContext']) | Types['EffectGlobalContext'];
  globalLayer?: ((conext: Types['Context']) => Types['EffectGlobalLayer']) | Types['EffectGlobalLayer'];
}>;
