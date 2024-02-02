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
import type { Effect } from 'effect';
import type { GraphQLResolveInfo } from 'graphql';
import type { IsEqual, IsTuple, NotAnyType } from 'type-plus';

export type ErrorConstructor = new (...args: any[]) => any;

export type InferRequirements<T> = T extends Runtime.Runtime<infer R>
  ? R
  : never;

export type InferError<ErrorTypes extends ErrorConstructor[]> =
  'errors' extends PluginName
    ? NotAnyType<InstanceType<ErrorTypes[number]>>
    : never;

export type NullableTypeToOption<
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

export type InferSucceedValue<Shape, Nullable, IsTypeTuple> =
  IsTypeTuple extends true
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
  ErrorTypes extends [...ErrorConstructor[]],
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

export type EffectOptions<Types extends SchemaTypes> = {
  effectRuntime: Types['EffectRuntime'];
};
