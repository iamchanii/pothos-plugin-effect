import type {
  FieldKind,
  FieldNullability,
  FieldOptionsFromKind,
  InputFieldMap,
  InputShapeFromFields,
  MaybePromise,
  OutputShape,
  PluginName,
  SchemaTypes,
  TypeParam,
} from '@pothos/core';
import type { Option, Runtime } from 'effect';
import type { GraphQLResolveInfo } from 'graphql';
import type { IsEqual, IsTuple } from 'type-plus';

import { Effect } from 'effect';

export type ErrorConstructor = new (...args: any[]) => Error;

type InferRequirements<T> = T extends Runtime.Runtime<infer R> ? R : never;

type InferError<ErrorTypes extends ErrorConstructor[]> =
  'errors' extends PluginName ? InstanceType<ErrorTypes[number]> : never;

type InferType<Shape> = Exclude<
  Shape,
  undefined | null
> extends readonly (infer T)[]
  ? T[]
  : Exclude<Shape, undefined | null>;

type NullableTypeToOption<
  Type,
  Nullable,
  Item = Type extends (infer T)[] ? T : Type,
> = IsEqual<Nullable, true> extends true
  ? Option.Option<Type>
  : IsEqual<Nullable, { items: true; list: false }> extends true
    ? Option.Option<Item>[]
    : IsEqual<Nullable, { items: false; list: true }> extends true
      ? Option.Option<Item[]>
      : IsEqual<Nullable, { items: true; list: true }> extends true
        ? Option.Option<Option.Option<Item | null>[]>
        : Type;

type InferSucceedValue<Shape, Nullable, IsTypeTuple> = IsTypeTuple extends true
  ? MaybePromise<NullableTypeToOption<Shape[], Nullable>>
  : MaybePromise<NullableTypeToOption<Shape, Nullable>>;

export type FieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Args extends InputFieldMap,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  ResolveReturnShape,
  // Effect Types:
  ErrorTypes extends ErrorConstructor[],
  // Pothos Types:
  Kind extends FieldKind = FieldKind,
> = Omit<
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
> & {
  errors?: 'errors' extends PluginName ? { types?: ErrorTypes } : never;
  resolve(
    parent: ParentShape,
    args: InputShapeFromFields<Args>,
    context: Types['Context'],
    info: GraphQLResolveInfo,
  ): Effect.Effect<
    InferRequirements<Types['EffectRuntime']>,
    InferError<ErrorTypes>,
    InferSucceedValue<
      OutputShape<
        Types,
        [Type] extends [null | readonly (infer Item)[] | undefined]
          ? Item
          : Type
      >,
      Nullable,
      IsTuple<Type>
    >
  >;
};

// export type ConnectionFieldOptions<
//   // Pothos Types:
//   Types extends SchemaTypes,
//   ParentShape,
//   Type extends OutputType<Types>,
//   Args extends InputFieldMap,
//   Nullable extends boolean,
//   ResolveReturnShape,
//   // Effect Types:
//   ServiceEntriesShape extends readonly [...ServiceEntry[]],
//   ContextsShape extends readonly [...Context[]],
//   LayersShape extends readonly [...Layer[]],
//   ErrorsShape extends readonly [...any[]],
//   // Pothos Types:
//   Kind extends FieldKind = FieldKind,
// > = Omit<
//   FieldOptions<
//     Types,
//     ParentShape,
//     Type,
//     Args,
//     Nullable,
//     ResolveReturnShape,
//     ServiceEntriesShape,
//     ContextsShape,
//     LayersShape,
//     ErrorsShape,
//     Kind
//   >,
//   'args' | 'resolve' | 'type'
// > &
//   Omit<
//     PothosSchemaTypes.ConnectionFieldOptions<
//       Types,
//       ParentShape,
//       Type,
//       Nullable,
//       false,
//       false,
//       Args,
//       ResolveReturnShape
//     >,
//     'resolve'
//   > &
//   (InputShapeFromFields<Args> &
//     PothosSchemaTypes.DefaultConnectionArguments extends infer ConnectionArgs
//     ? {
//         resolve(
//           parent: ParentShape,
//           args: ConnectionArgs,
//           context: Types['Context'],
//           info: GraphQLResolveInfo,
//         ): Effect.Effect<
//           Runtime.Runtime
//           //  <Types['EffectRuntime']>,
//           GetEffectErrors<ErrorsShape>,
//           ShapeFromConnection<
//             PothosSchemaTypes.ConnectionShapeHelper<
//               Types,
//               ShapeFromTypeParam<Types, Type, false>,
//               Nullable
//             >
//           >
//         >;
//         type: Type;
//       }
//     : never);

// export type ShapeFromConnection<T> = T extends { shape: unknown }
//   ? T['shape']
//   : never;

export type EffectOptions<Types extends SchemaTypes> = {
  effectRuntime: Types['EffectRuntime'];
};

// export type PrismaRef<Model extends PrismaModelTypes, T = {}> =
//   | PrismaInterfaceRef<Model, T>
//   | PrismaObjectRef<Model, T>;

// export type WithBrand<T> = T & { [typeBrandKey]: string };

// export type PrismaFieldResolver<
//   Types extends SchemaTypes,
//   Model extends PrismaModelTypes,
//   Parent,
//   Param extends TypeParam<Types>,
//   Args extends InputFieldMap,
//   Nullable extends FieldNullability<Param>,
//   ResolveReturnShape,
//   // Effect Types:
//   ServiceEntriesShape extends readonly [...ServiceEntry[]],
//   ContextsShape extends readonly [...Context[]],
//   LayersShape extends readonly [...Layer[]],
//   ErrorsShape extends readonly [...any[]],
// > = (
//   query: {
//     include?: Model['Include'];
//     select?: Model['Select'];
//   },
//   parent: Parent,
//   args: InputShapeFromFields<Args>,
//   context: Types['Context'],
//   info: GraphQLResolveInfo,
// ) => Effect.Effect<
//   GetEffectRequirements<Types, ServiceEntriesShape, ContextsShape, LayersShape>,
//   GetEffectErrors<ErrorsShape>,
//   GetEffectOutputShape<
//     ShapeFromTypeParam<Types, Param, Nullable> extends infer Shape
//       ? [Shape] extends [[readonly (infer Item)[] | null | undefined]]
//         ? ListResolveValue<Shape, Item, ResolveReturnShape>
//         : MaybePromise<Shape>
//       : never,
//     Nullable
//   >
// >;

// export type PrismaFieldOptions<
//   // Pothos Types:
//   Types extends SchemaTypes,
//   ParentShape,
//   Type extends
//     | PrismaRef<PrismaModelTypes>
//     | keyof Types['PrismaTypes']
//     | [keyof Types['PrismaTypes']]
//     | [PrismaRef<PrismaModelTypes>],
//   Model extends PrismaModelTypes,
//   Param extends TypeParam<Types>,
//   Args extends InputFieldMap,
//   Nullable extends FieldNullability<Param>,
//   ResolveShape,
//   ResolveReturnShape,
//   // Effect Types:
//   ServiceEntriesShape extends readonly [...ServiceEntry[]],
//   ContextsShape extends readonly [...Context[]],
//   LayersShape extends readonly [...Layer[]],
//   ErrorsShape extends readonly [...any[]],
//   // Pothos Types:
//   Kind extends FieldKind = FieldKind,
// > = FieldOptionsFromKind<
//   Types,
//   ParentShape,
//   Param,
//   Nullable,
//   Args,
//   Kind,
//   ResolveShape,
//   ResolveReturnShape
// > extends infer FieldOptions
//   ? Omit<FieldOptions, 'resolve' | 'type'> & {
//       type: Type;
//       effect?: FieldEffectOptions<
//         ServiceEntriesShape,
//         ContextsShape,
//         LayersShape
//       >;
//       errors?: 'errors' extends PluginName ? { types?: ErrorsShape } : never;
//       resolve: FieldOptions extends {
//         resolve?: (parent: infer Parent, ...args: any[]) => unknown;
//       }
//         ? PrismaFieldResolver<
//             Types,
//             Model,
//             Parent,
//             Param,
//             Args,
//             Nullable,
//             ResolveReturnShape,
//             ServiceEntriesShape,
//             ContextsShape,
//             LayersShape,
//             ErrorsShape
//           >
//         : PrismaFieldResolver<
//             Types,
//             Model,
//             ParentShape,
//             Param,
//             Args,
//             Nullable,
//             ResolveReturnShape,
//             ServiceEntriesShape,
//             ContextsShape,
//             LayersShape,
//             ErrorsShape
//           >;
//     }
//   : never;
