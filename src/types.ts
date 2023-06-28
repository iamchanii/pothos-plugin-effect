/* eslint-disable @typescript-eslint/no-explicit-any */

import type * as EffectContext from '@effect/data/Context';
import type { FieldKind, FieldOptionsFromKind, InputFieldMap, OutputShape, SchemaTypes, TypeParam } from '@pothos/core';
import type { GraphQLResolveInfo } from 'graphql';

import * as Effect from '@effect/io/Effect';

type Equals<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;

export type ServiceEntry = [
  tag: EffectContext.Tag<any, any>,
  service: any,
];

export type Context = EffectContext.Context<any>;

type GetEffectRequirementsFromServiceEntries<
  ServiceEntries extends [...ServiceEntry[]],
> = Equals<ServiceEntries, ServiceEntry[]> extends true ? never
  : keyof {
    [K in ServiceEntries[number] as K extends [EffectContext.Tag<infer U, any>, any] ? U : never]: true;
  };

type GetEffectRequirementsFromContexts<
  Contexts extends [...Context[]],
> = Equals<Contexts, Context[]> extends true ? never
  : keyof {
    [K in Contexts[number] as K extends EffectContext.Context<infer U> ? U : never]: true;
  };

type GetEffectRequirements<
  ServiceEntries extends [...ServiceEntry[]],
  Contexts extends [...Context[]],
> =
  | GetEffectRequirementsFromContexts<Contexts>
  | GetEffectRequirementsFromServiceEntries<ServiceEntries>;

export type FieldOptions<
  // Pothos Types:
  Types extends SchemaTypes,
  ParentShape,
  Type extends TypeParam<Types>,
  Args extends InputFieldMap,
  ResolveReturnShape,
  // Effect Types:
  ServiceEntriesShape extends [...ServiceEntry[]],
  ContextsShape extends [...Context[]],
  EffectContext = GetEffectRequirements<ServiceEntriesShape, ContextsShape>,
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
      services?: (context: Types['Context']) => ServiceEntriesShape;
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
