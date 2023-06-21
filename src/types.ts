import * as Context from '@effect/data/Context';
import * as Effect from '@effect/io/Effect';
import { FieldKind, FieldOptionsFromKind, InputFieldMap, OutputShape, SchemaTypes, TypeParam } from '@pothos/core';
import { GraphQLResolveInfo } from 'graphql/type';

export type Service<Types extends SchemaTypes = SchemaTypes> = [
  Context.Tag<any, any>,
  (context: Types['Context']) => any,
];

type GetService<T> = T extends Service ? T[0] extends Context.Tag<any, infer U> ? U : never : never;

type RequirementsFromServices<Services, Acc = never> = undefined extends Services ? never
  : Services extends Readonly<[infer Head, ...infer Tail]> ? RequirementsFromServices<Tail, Acc | GetService<Head>>
  : Acc;

export type EffectFieldOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Args extends InputFieldMap,
  ResolveReturnShape,
  ProvideServices extends Readonly<[Service<Types>, ...Service<Types>[]]> | undefined,
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
    provideServices?: ProvideServices;

    resolve(
      parent: ParentShape,
      args: Args,
      context: Types['Context'],
      info: GraphQLResolveInfo,
    ): Effect.Effect<
      RequirementsFromServices<ProvideServices>,
      unknown,
      OutputShape<Types, Type>
    >;
  };
