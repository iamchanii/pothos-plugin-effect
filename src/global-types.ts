import type { FieldKind, FieldRef, InputFieldMap, SchemaTypes, TypeParam } from '@pothos/core';

import type { EffectPlugin } from './index.js';
import type * as EffectPluginTypes from './types.js';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: EffectPlugin<Types>;
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
