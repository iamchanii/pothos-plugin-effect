import type * as C from '@effect/data/Context';
import type * as Effect from '@effect/io/Effect';
import type {
  FieldKind,
  FieldOptionsFromKind,
  FieldRef,
  InputFieldMap,
  OutputShape,
  SchemaTypes,
  TypeParam,
} from '@pothos/core';
import type { GraphQLResolveInfo } from 'graphql';

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

export type Service = C.Tag<any, any>;

export type ServiceEntry = [Service, any];

export type ServicesFn<Types extends SchemaTypes = SchemaTypes> = (
  context: Types['Context'],
) => readonly [] | readonly [ServiceEntry, ...ServiceEntry[]];

export type InferService<T> = T extends ServiceEntry ? T[0] extends C.Tag<any, infer U> ? U
  : never
  : never;

export type InferService2<T> = T;

export type Context = C.Context<any>;

export type InferContext<T> = T extends C.Context<infer U> ? U : never;

export type InferRequirementsFromServiceEntries<T extends [...ServiceEntry[]]> = Equals<T, ServiceEntry[]> extends true
  ? {}
  : { [K in T[number] as K extends [C.Tag<infer U, any>, any] ? U : never]: true };

export type InferRequirementsFromContexts<T extends [...Context[]]> = Equals<T, Context[]> extends true ? {} : {
  [K in T[number] as K extends C.Context<infer U> ? U : never]: true;
};

export type EffectFieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Args extends InputFieldMap,
  ResolveReturnShape,
  // Effect Types:
  ServicesShape extends [...ServiceEntry[]],
  ContextsShape extends [...Context[]],
  // $ServicesFn extends ServicesFn<Types>,
  // $Context extends Context,
  // $EffectFieldReturnType extends EffectFieldReturnType<
  //   Types,
  //   Type,
  //   $ServicesFn,
  //   $Context
  // > = EffectFieldReturnType<
  //   Types,
  //   Type,
  //   $ServicesFn,
  //   $Context
  // >,
  EffectContext =
    keyof (InferRequirementsFromContexts<ContextsShape> & InferRequirementsFromServiceEntries<ServicesShape>),
  // Pothos Types:
  Kind extends FieldKind = FieldKind,
> =
  & Omit<
    FieldOptionsFromKind<
      Types,
      ParentShape,
      Type,
      false,
      Args,
      Kind,
      ParentShape,
      ResolveReturnShape
    >,
    'resolve'
  >
  & {
    effect?: {
      contexts?: (context: Types['Context']) => ContextsShape;
      services?: (context: Types['Context']) => ServicesShape;
      // To be done:
      // layer: (context: Types['Context']) => unknown;
    };
    resolve(
      parent: ParentShape,
      args: Args,
      context: Types['Context'],
      info: GraphQLResolveInfo,
    ): Effect.Effect<EffectContext, never, OutputShape<Types, Type>>;
  };

export type EffectField<
  Types extends SchemaTypes,
  ParentShape,
> = <
  // Pothos Types:
  Args extends InputFieldMap,
  Type extends TypeParam<Types>,
  ResolveShape,
  // Effect Types:
  ServicesShape extends [...ServiceEntry[]],
  ContextsShape extends [...Context[]],
> // $ServicesFn extends ServicesFn<Types>,
// $Context extends Context,
(
  options: EffectFieldOptions<
    Types,
    ParentShape,
    Type,
    Args,
    ResolveShape,
    ServicesShape,
    ContextsShape
  >, // $ServicesFn,
  // $Context
) => FieldRef<unknown>;
