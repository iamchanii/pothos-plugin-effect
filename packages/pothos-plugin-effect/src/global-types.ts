import type {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import type { Runtime } from 'effect';
import type { EffectPlugin } from './index.js';
import type * as PluginTypes from './types.js';

declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: EffectPlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      effectOptions?: PluginTypes.EffectPluginOptions<Types>;
    }

    export interface UserSchemaTypes {
      EffectRuntime: Runtime.Runtime<never>;
    }

    export interface ExtendDefaultTypes<
      PartialTypes extends Partial<UserSchemaTypes>,
    > {
      EffectRuntime: PartialTypes['EffectRuntime'] & {};
    }

    export interface RootFieldBuilder<
      Types extends SchemaTypes,
      ParentShape,
      Kind extends FieldKind = FieldKind,
    > {
      executeEffect: PluginTypes.ExecuteEffect<Types>;

      effect: <
        Type extends TypeParam<Types>,
        Nullable extends FieldNullability<Type>,
        Args extends InputFieldMap,
        ResolveReturnShape,
      >(
        options: PluginTypes.EffectFieldOptions<
          Types,
          ParentShape,
          Type,
          Nullable,
          Args,
          ResolveReturnShape
        >,
      ) => FieldRef<ShapeFromTypeParam<Types, Type, Nullable>>;
    }
  }
}
