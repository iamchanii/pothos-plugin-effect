/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-interface */
import type {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  InterfaceParam,
  NormalizeArgs,
  OutputType,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import type { PrismaModelTypes, prismaModelKey } from '@pothos/plugin-prisma';
import type { Context, Layer } from 'effect';

import type * as EffectPlugin from './';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: EffectPlugin.EffectPlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      effectOptions?: EffectPlugin.PluginOptions<Types>;
    }

    export interface UserSchemaTypes {
      EffectGlobalContext: Context.Context<never>;
      EffectGlobalLayer: Layer.Layer<never, never, never>;
    }

    export interface ExtendDefaultTypes<PartialTypes extends Partial<UserSchemaTypes>> {
      EffectGlobalContext: PartialTypes['EffectGlobalContext'] & {};
      EffectGlobalLayer: PartialTypes['EffectGlobalLayer'] & {};
    }

    export interface RootFieldBuilder<
      Types extends SchemaTypes,
      ParentShape,
      Kind extends FieldKind = FieldKind,
    > {
      effect: <
        // Pothos Types:
        Args extends InputFieldMap,
        Type extends TypeParam<Types>,
        Nullable extends FieldNullability<Type>,
        ResolveShape,
        // Effect Types:
        ServiceEntriesShape extends readonly [...EffectPlugin.ServiceEntry[]],
        ContextsShape extends readonly [...EffectPlugin.Context[]],
        LayersShape extends readonly [...EffectPlugin.Layer[]],
        ErrorsShape extends readonly [...any[]],
      >(
        options: EffectPlugin.FieldOptions<
          // Pothos Types:
          Types,
          ParentShape,
          Type,
          Args,
          Nullable,
          ResolveShape,
          // Effect Types:
          ServiceEntriesShape,
          ContextsShape,
          LayersShape,
          ErrorsShape
        >,
      ) => FieldRef<unknown>;

      effectConnection: 'relay' extends PluginName ? <
          Type extends OutputType<Types>,
          Nullable extends boolean,
          ResolveReturnShape,
          // Effect Types:
          ServiceEntriesShape extends readonly [...EffectPlugin.ServiceEntry[]],
          ContextsShape extends readonly [...EffectPlugin.Context[]],
          LayersShape extends readonly [...EffectPlugin.Layer[]],
          ErrorsShape extends readonly [...any[]],
          // Relay Types:
          Args extends InputFieldMap = {},
          ConnectionInterfaces extends InterfaceParam<Types>[] = [],
          EdgeInterfaces extends InterfaceParam<Types>[] = [],
        >(
          options: EffectPlugin.ConnectionFieldOptions<
            Types,
            ParentShape,
            Type,
            Args,
            Nullable,
            ResolveReturnShape,
            ServiceEntriesShape,
            ContextsShape,
            LayersShape,
            ErrorsShape,
            Kind
          >,
          ...args: NormalizeArgs<
            [
              connectionOptions:
                | ConnectionObjectOptions<
                  Types,
                  Type,
                  false,
                  false,
                  ResolveReturnShape,
                  ConnectionInterfaces
                >
                | ObjectRef<
                  EffectPlugin.ShapeFromConnection<
                    ConnectionShapeHelper<Types, ShapeFromTypeParam<Types, Type, false>, false>
                  >
                >,
              edgeOptions:
                | ConnectionEdgeObjectOptions<
                  Types,
                  Type,
                  false,
                  ResolveReturnShape,
                  EdgeInterfaces
                >
                | ObjectRef<{
                  cursor: string;
                  node?: ShapeFromTypeParam<Types, Type, false> | null | undefined;
                }>,
            ],
            0
          >
        ) => FieldRef<
          EffectPlugin.ShapeFromConnection<
            ConnectionShapeHelper<Types, ShapeFromTypeParam<Types, Type, false>, Nullable>
          >
        >
        : '@pothos/plugin-relay is required to use this method';

      prismaEffect: 'prisma' extends PluginName ? <
          // Pothos Types:
          Args extends InputFieldMap,
          TypeParam extends
            | EffectPlugin.PrismaRef<PrismaModelTypes>
            | keyof Types['PrismaTypes']
            | [keyof Types['PrismaTypes']]
            | [EffectPlugin.PrismaRef<PrismaModelTypes>],
          Nullable extends FieldNullability<Type>,
          ResolveShape,
          ResolveReturnShape,
          Type extends TypeParam extends [unknown] ? [ObjectRef<Model['Shape']>]
            : ObjectRef<Model['Shape']>,
          // Effect Types:
          ServiceEntriesShape extends readonly [...EffectPlugin.ServiceEntry[]],
          ContextsShape extends readonly [...EffectPlugin.Context[]],
          LayersShape extends readonly [...EffectPlugin.Layer[]],
          ErrorsShape extends readonly [...any[]],
          // Pothos Types:
          Model extends PrismaModelTypes =
            & PrismaModelTypes
            & (TypeParam extends [keyof Types['PrismaTypes']] ? Types['PrismaTypes'][TypeParam[0]]
              : TypeParam extends [EffectPlugin.PrismaRef<PrismaModelTypes>] ? TypeParam[0][typeof prismaModelKey]
              : TypeParam extends EffectPlugin.PrismaRef<PrismaModelTypes> ? TypeParam[typeof prismaModelKey]
              : TypeParam extends keyof Types['PrismaTypes'] ? Types['PrismaTypes'][TypeParam]
              : never),
        >(
          options: EffectPlugin.PrismaFieldOptions<
            // Pothos Types:
            Types,
            ParentShape,
            TypeParam,
            Model,
            Type,
            Args,
            Nullable,
            ResolveShape,
            ResolveReturnShape,
            ServiceEntriesShape,
            ContextsShape,
            LayersShape,
            ErrorsShape,
            Kind
          >,
        ) => FieldRef<unknown>
        : '@pothos/plugin-prisma is required to use this method';
    }

    export interface ConnectionShapeHelper<Types extends SchemaTypes, T, Nullable> {}

    export interface DefaultConnectionArguments {
      after?: null | string | undefined;
      before?: null | string | undefined;
      first?: null | number | undefined;
      last?: null | number | undefined;
    }

    export interface ConnectionFieldOptions<
      Types extends SchemaTypes,
      ParentShape,
      Type extends OutputType<Types>,
      Nullable extends boolean,
      EdgeNullability extends FieldNullability<[unknown]>,
      NodeNullability extends boolean,
      Args extends InputFieldMap,
      ResolveReturnShape,
    > {}

    export interface ConnectionObjectOptions<
      Types extends SchemaTypes,
      Type extends OutputType<Types>,
      EdgeNullability extends FieldNullability<[unknown]>,
      NodeNullability extends boolean,
      Resolved,
      Interfaces extends InterfaceParam<Types>[] = [],
    > {}

    export interface ConnectionEdgeObjectOptions<
      Types extends SchemaTypes,
      Type extends OutputType<Types>,
      NodeNullability extends boolean,
      Resolved,
      Interfaces extends InterfaceParam<Types>[] = [],
    > {}
  }
}
