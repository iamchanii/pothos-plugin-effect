import type {
  FieldNullability,
  InputFieldMap,
  InputShapeFromFields,
  MaybePromise,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import type { Effect, Option, Runtime } from 'effect';
import type { InferValueType } from 'effect-utils';
import { GraphQLResolveInfo } from 'graphql';

type InferRequirements<T> = T extends Runtime.Runtime<infer R> ? R : never;

export type EffectPluginOptions<Types extends SchemaTypes> = {
  effectRuntime: Types['EffectRuntime'];
};

type MaybeOption<T> =
  | T
  /**
   * This is more flexible than the way Effect handles nullable values,
   * which means you can use `Option<T>` with `null` and `undefined`.
   *
   * This can be handled strictly via plugin options later.
   */
  | (null extends T ? Option.Option<T> | null | undefined : never);

type Resolver<R extends Runtime.Runtime<never>, Parent, Args, Context, Type> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => [Type] extends [readonly (infer Item)[] | null | undefined]
  ? ListResolveValue<R, Type, Item>
  : Effect.Effect<MaybePromise<MaybeOption<Type>>, never, R>;

type ListResolveValue<
  R extends Runtime.Runtime<never>,
  Type,
  Item,
> = null extends Type
  ? Effect.Effect<MaybeOption<readonly MaybeOption<Item>[]>, never, R>
  : Effect.Effect<readonly MaybeOption<Item>[], never, R>;

// Note: should be able to use the Stream API provided by Effect.
// type GeneratorResolver<Type, Item> = null extends Type
//   ? AsyncGenerator<Item | null | undefined, Item | null | undefined>
//   : AsyncGenerator<Item, Item>;

export interface EffectFieldOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  ResolveReturnShape,
> extends Omit<
    PothosSchemaTypes.FieldOptions<
      Types,
      ParentShape,
      Type,
      Nullable,
      Args,
      ParentShape,
      ResolveReturnShape
    >,
    'resolve'
  > {
  resolve: Resolver<
    Types['EffectRuntime'],
    ParentShape,
    InputShapeFromFields<Args>,
    Types['Context'],
    ShapeFromTypeParam<Types, Type, Nullable>
  >;
}

export interface ExecuteEffect<
  // Pothos Types:
  Types extends SchemaTypes,
> {
  <A, E, R extends InferRequirements<Types['EffectRuntime']>>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<Awaited<InferValueType<A>>>;
}
