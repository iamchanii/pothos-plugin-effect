import type { MaybePromise, PluginName, SchemaTypes } from '@pothos/core';
import type { Effect, Option, Runtime } from 'effect';
import type { IsEqual, NotAnyType } from 'type-plus';
import { InferEffectValueType } from './handleNullableValue.js';

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

export type EffectOptions<Types extends SchemaTypes> = {
  effectRuntime: Types['EffectRuntime'];
};

export interface FieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
> {
  <
    // Effect Types:
    R extends InferRequirements<Types['EffectRuntime']>,
    E,
    A,
  >(
    effect: Effect.Effect<R, E, A>,
  ): Promise<Awaited<InferEffectValueType<A>>>;
}
