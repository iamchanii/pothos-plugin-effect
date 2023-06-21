import { FieldKind, FieldRef, InputFieldMap, SchemaTypes, TypeParam } from '@pothos/core';

import { PothosEffectPlugin } from './index.js';
import { EffectFieldOptions, Service } from './types.js';

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
      effect: <
        Args extends InputFieldMap,
        Type extends TypeParam<Types>,
        ResolveShape,
        ProvideServices extends Readonly<[Service<Types>, ...Service<Types>[]]> | undefined,
      >(
        options: EffectFieldOptions<
          Types,
          ParentShape,
          Type,
          Args,
          ResolveShape,
          ProvideServices
        >,
      ) => FieldRef<unknown>;
    }
  }
}

export {};
