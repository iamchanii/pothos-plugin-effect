import type {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  PluginName,
  SchemaTypes,
} from '@pothos/core';
import { PrismaModelTypes, prismaModelKey } from '@pothos/plugin-prisma';
import { ErrorConstructor } from '../core/types.js';
import type * as Types from './types.js';

declare global {
  export namespace PothosSchemaTypes {
    export interface RootFieldBuilder<
      Types extends SchemaTypes,
      ParentShape,
      Kind extends FieldKind = FieldKind,
    > {
      prismaEffect: 'prisma' extends PluginName
        ? <
            // Pothos Types:
            Args extends InputFieldMap,
            TypeParam extends
              | Types.PrismaRef<PrismaModelTypes>
              | keyof Types['PrismaTypes']
              | [keyof Types['PrismaTypes']]
              | [Types.PrismaRef<PrismaModelTypes>],
            Nullable extends FieldNullability<Type>,
            ResolveShape,
            ResolveReturnShape,
            Type extends TypeParam extends [unknown]
              ? [ObjectRef<Model['Shape']>]
              : ObjectRef<Model['Shape']>,
            // Effect Types:
            ErrorTypes extends [...ErrorConstructor[]],
            // Pothos Types:
            Model extends PrismaModelTypes = PrismaModelTypes &
              (TypeParam extends [keyof Types['PrismaTypes']]
                ? Types['PrismaTypes'][TypeParam[0]]
                : TypeParam extends [Types.PrismaRef<PrismaModelTypes>]
                  ? TypeParam[0][typeof prismaModelKey]
                  : TypeParam extends Types.PrismaRef<PrismaModelTypes>
                    ? TypeParam[typeof prismaModelKey]
                    : TypeParam extends keyof Types['PrismaTypes']
                      ? Types['PrismaTypes'][TypeParam]
                      : never),
          >(
            options: Types.PrismaFieldOptions<
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
              ErrorTypes,
              Kind
            >,
          ) => FieldRef<unknown>
        : '@pothos/plugin-prisma is required to use this method';
    }
  }
}
