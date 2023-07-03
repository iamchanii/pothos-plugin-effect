/* eslint-disable @typescript-eslint/ban-types */
import type * as Context from '@effect/data/Context';
import type * as Layer from '@effect/io/Layer';
import type { FieldKind, FieldRef, InputFieldMap, SchemaTypes, TypeParam } from '@pothos/core';

import type { EffectPlugin } from './index.js';
import type * as EffectPluginTypes from './types.js';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: EffectPlugin<Types>;
    }

    export interface SchemaBuilderOptions<Types extends SchemaTypes> {
      effectOptions?: EffectPluginTypes.PluginOptions<Types>;
    }

    export interface UserSchemaTypes {
      EffectGlobalContext: Context.Context<any>;
      EffectGlobalLayer: Layer.Layer<never, never, any>;
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
        ResolveShape,
        // Effect Types:
        ServiceEntriesShape extends readonly [...EffectPluginTypes.ServiceEntry[]],
        ContextsShape extends readonly [...EffectPluginTypes.Context[]],
        LayersShape extends readonly [...EffectPluginTypes.Layer[]],
      >(
        options: EffectPluginTypes.FieldOptions<
          // Pothos Types:
          Types,
          ParentShape,
          Type,
          Args,
          ResolveShape,
          // Effect Types:
          ServiceEntriesShape,
          ContextsShape,
          LayersShape
        >,
      ) => FieldRef<unknown>;
    }
  }
}
