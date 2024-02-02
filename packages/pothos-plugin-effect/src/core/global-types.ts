import type {
  FieldKind,
  FieldNullability,
  FieldRef,
  InputFieldMap,
  SchemaTypes,
  TypeParam,
} from '@pothos/core';
import type { Runtime } from 'effect';
import type { EffectPlugin } from './index.js';
import type * as Types from './types.js';

declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: EffectPlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      effectOptions?: Types.EffectOptions<Types>;
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
      effect: <
        // Pothos Types:
        Args extends InputFieldMap,
        Type extends TypeParam<Types>,
        Nullable extends FieldNullability<Type>,
        ResolveShape,
        // Effect Types:
        ErrorTypes extends [...Types.ErrorConstructor[]],
      >(
        options: Types.FieldOptions<
          // Pothos Types:
          Types,
          ParentShape,
          Args,
          Type,
          Nullable,
          ResolveShape,
          // Effect Types:
          ErrorTypes
        >,
      ) => FieldRef<unknown>;
    }
  }
}
