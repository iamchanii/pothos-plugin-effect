import type {
  FieldKind,
  FieldNullability,
  InputFieldMap,
  InputFieldRef,
  InputShapeFromFields,
  MaybePromise,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import type { Effect, Option, Runtime, Stream } from 'effect';
import type { InferValueType } from 'effect-utils';
import { GraphQLResolveInfo } from 'graphql';

type InferRequirements<T> = T extends Runtime.Runtime<infer R> ? R : never;

type MaybeOption<T> =
  | T
  /**
   * This is more flexible than the way Effect handles nullable values,
   * which means you can use `Option<T>` with `null` and `undefined`.
   *
   * This can be handled strictly via plugin options later.
   */
  | (null extends T ? Option.Option<T> | null | undefined : never);

type Resolver<
  R extends Runtime.Runtime<never>,
  Parent,
  Args,
  Context,
  Type,
  Return,
> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => [Type] extends [readonly (infer Item)[] | null | undefined]
  ? ListResolveValue<R, Type, Item, Return>
  : Effect.Effect<
      MaybePromise<MaybeOption<Type>>,
      unknown,
      InferRequirements<R>
    >;

type ListResolveValue<R extends Runtime.Runtime<never>, Type, Item, Return> = [
  Return,
] extends [Stream.Stream<unknown>]
  ? GeneratorResolver<Type, Item> | Return
  : null extends Type
    ? Effect.Effect<
        MaybeOption<readonly MaybeOption<Item>[]>,
        unknown,
        InferRequirements<R>
      >
    : Effect.Effect<
        readonly MaybeOption<Item>[],
        unknown,
        InferRequirements<R>
      >;

type GeneratorResolver<Type, Item> = null extends Type
  ? Stream.Stream<MaybeOption<Item>>
  : Stream.Stream<Item>;

type Subscriber<
  R extends Runtime.Runtime<never>,
  Parent,
  Args,
  Context,
  Shape,
> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo,
) => Stream.Stream<Shape, unknown, InferRequirements<R>>;

interface FieldOptionsByKind<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  ResolveShape,
  ResolveReturnShape,
> {
  Query: Omit<
    PothosSchemaTypes.QueryFieldOptions<
      Types,
      Type,
      Nullable,
      Args,
      ResolveReturnShape
    >,
    'resolve'
  > & {
    resolve: Resolver<
      Types['EffectRuntime'],
      Types['Root'],
      InputShapeFromFields<Args>,
      Types['Context'],
      ShapeFromTypeParam<Types, Type, Nullable>,
      ResolveReturnShape
    >;
  };

  Mutation: Omit<
    PothosSchemaTypes.MutationFieldOptions<
      Types,
      Type,
      Nullable,
      Args,
      ResolveReturnShape
    >,
    'resolve'
  > & {
    resolve: Resolver<
      Types['EffectRuntime'],
      Types['Root'],
      InputShapeFromFields<Args>,
      Types['Context'],
      ShapeFromTypeParam<Types, Type, Nullable>,
      ResolveReturnShape
    >;
  };

  Subscription: Omit<
    PothosSchemaTypes.SubscriptionFieldOptions<
      Types,
      Type,
      Nullable,
      Args,
      ResolveShape,
      ResolveReturnShape
    >,
    'resolve' | 'subscribe'
  > & {
    resolve: Resolver<
      Types['EffectRuntime'],
      ResolveShape,
      InputShapeFromFields<Args>,
      Types['Context'],
      ShapeFromTypeParam<Types, Type, Nullable>,
      ResolveReturnShape
    >;
    subscribe: Subscriber<
      Types['EffectRuntime'],
      Types['Root'],
      InputShapeFromFields<Args>,
      Types['Context'],
      ResolveShape
    >;
  };

  Object: Omit<
    PothosSchemaTypes.ObjectFieldOptions<
      Types,
      ParentShape,
      Type,
      Nullable,
      Args,
      ResolveReturnShape
    >,
    'resolve'
  > & {
    resolve: Resolver<
      Types['EffectRuntime'],
      ParentShape,
      InputShapeFromFields<Args>,
      Types['Context'],
      ShapeFromTypeParam<Types, Type, Nullable>,
      ResolveReturnShape
    >;
  };

  Interface: Omit<
    PothosSchemaTypes.InterfaceFieldOptions<
      Types,
      ParentShape,
      Type,
      Nullable,
      Args,
      ResolveReturnShape
    >,
    'resolve'
  > & {
    resolve: Resolver<
      Types['EffectRuntime'],
      ParentShape,
      InputShapeFromFields<Args>,
      Types['Context'],
      ShapeFromTypeParam<Types, Type, Nullable>,
      ResolveReturnShape
    >;
  };

  PrismaObject: never;
}

export type EffectFieldOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends InputFieldMap,
  Kind extends FieldKind,
  ResolveShape,
  ResolveReturnShape,
> = FieldOptionsByKind<
  Types,
  ParentShape,
  Type,
  Nullable,
  Args,
  ResolveShape,
  ResolveReturnShape
>[Kind];

export type EffectFieldWithInputOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Nullable extends FieldNullability<Type>,
  Args extends Record<string, InputFieldRef<unknown, 'Arg'>>,
  Kind extends FieldKind,
  ResolveShape,
  ResolveReturnShape,
  Fields extends Record<string, InputFieldRef<unknown, 'InputObject'>>,
  InputName extends string,
  ArgRequired extends boolean,
> = Omit<
  EffectFieldOptions<
    Types,
    ParentShape,
    Type,
    Nullable,
    Args & {
      [K in InputName]: InputFieldRef<
        | InputShapeFromFields<Fields>
        | (true extends ArgRequired ? never : null | undefined)
      >;
    },
    Kind,
    ResolveShape,
    ResolveReturnShape
  >,
  'args'
> &
  // @ts-ignore
  PothosSchemaTypes.FieldWithInputBaseOptions<
    Types,
    Args & {
      [K in InputName]: InputFieldRef<
        | InputShapeFromFields<Fields>
        | (true extends ArgRequired ? never : null | undefined)
      >;
    },
    Fields,
    InputName,
    ArgRequired
  >;

export type EffectPluginOptions<Types extends SchemaTypes> = {
  effectRuntime: Types['EffectRuntime'];
};

export interface ExecuteEffect<
  // Pothos Types:
  Types extends SchemaTypes,
> {
  <A, E, R extends InferRequirements<Types['EffectRuntime']>>(
    effect: Effect.Effect<A, E, R>,
  ): Promise<Awaited<InferValueType<A>>>;
}

export interface ExecuteStream<
  // Pothos Types:
  Types extends SchemaTypes,
> {
  <A, E, R extends InferRequirements<Types['EffectRuntime']>>(
    stream: Stream.Stream<A, E, R>,
  ): AsyncIterable<A>;
}
