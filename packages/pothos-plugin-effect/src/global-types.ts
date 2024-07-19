import type {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@pothos/core';
import type { Effect, Runtime } from 'effect';
import type { EffectPlugin } from './index.js';
import type * as PluginTypes from './types.js';

declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: EffectPlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      effect?: PluginTypes.EffectPluginOptions<Types>;
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
      executeStream: PluginTypes.ExecuteStream<Types>;

      effect: <
        Type extends TypeParam<Types>,
        Nullable extends FieldNullability<Type>,
        Args extends InputFieldMap,
        ResolveShape,
        ResolveReturnShape extends Effect.Effect<unknown, unknown, unknown>,
      >(
        options: PluginTypes.EffectFieldOptions<
          Types,
          ParentShape,
          Type,
          Nullable,
          Args,
          Kind,
          ResolveShape,
          ResolveReturnShape
        >,
      ) => FieldRef<Types, ShapeFromTypeParam<Types, Type, Nullable>>;

      effectWithInput: 'withInput' extends PluginName
        ? <
            Type extends TypeParam<Types>,
            Nullable extends FieldNullability<Type>,
            Args extends InputFieldMap,
            ResolveShape,
            ResolveReturnShape extends Effect.Effect<unknown, unknown, unknown>,
            Fields extends InputFieldMap,
            InputName extends string,
            ArgRequired extends boolean,
          >(
            options: PluginTypes.EffectFieldWithInputOptions<
              Types,
              ParentShape,
              Type,
              Nullable,
              Args,
              Kind,
              ResolveShape,
              ResolveReturnShape,
              Fields,
              InputName,
              ArgRequired
            >,
          ) => FieldRef<Types, ShapeFromTypeParam<Types, Type, Nullable>>
        : '@pothos/plugin-with-input is required to use this method';
    }

    interface FieldWithInputBaseOptions<
      Types extends SchemaTypes,
      Args extends InputFieldMap,
      Fields extends InputFieldMap,
      InputName extends string,
      ArgRequired extends boolean,
    > {}
  }
}
