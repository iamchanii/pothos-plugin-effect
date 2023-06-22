import type { FieldKind, SchemaTypes } from '@pothos/core';

import type { PothosEffectPlugin } from './index.js';
import type * as PothosEffectPluginTypes from './types.js';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  export namespace PothosSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      effect: PothosEffectPlugin<Types>;
    }

    export interface RootFieldBuilder<
      Types extends SchemaTypes,
      ParentShape,
      Kind extends FieldKind = FieldKind,
    > {
      effect: PothosEffectPluginTypes.EffectField<Types, ParentShape>;
    }
  }
}
