import * as Effect from '@effect/io/Effect';
import {
  FieldKind,
  FieldOptionsFromKind,
  InputFieldMap,
  InputShapeFromFields,
  OutputRefShape,
  Resolver,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import { GraphQLResolveInfo } from 'graphql/type';

export type EffectFieldOptions<
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Args extends InputFieldMap,
  ResolveReturnShape,
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
    resolve(
      parent: ParentShape,
      args: Args,
      context: Types['Context'],
      info: GraphQLResolveInfo,
    ): Effect.Effect<never, unknown, Type>;
  };
