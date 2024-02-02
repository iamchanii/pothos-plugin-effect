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

      // effectConnection: 'relay' extends PluginName
      //   ? <
      //       Type extends OutputType<Types>,
      //       Nullable extends boolean,
      //       ResolveReturnShape,
      //       // Effect Types:
      //       ServiceEntriesShape extends readonly [
      //         ...EffectPlugin.ServiceEntry[],
      //       ],
      //       ContextsShape extends readonly [...EffectPlugin.Context[]],
      //       LayersShape extends readonly [...EffectPlugin.Layer[]],
      //       ErrorsShape extends readonly [...any[]],
      //       // Relay Types:
      //       Args extends InputFieldMap = {},
      //       ConnectionInterfaces extends InterfaceParam<Types>[] = [],
      //       EdgeInterfaces extends InterfaceParam<Types>[] = [],
      //     >(
      //       options: EffectPlugin.ConnectionFieldOptions<
      //         Types,
      //         ParentShape,
      //         Type,
      //         Args,
      //         Nullable,
      //         ResolveReturnShape,
      //         ServiceEntriesShape,
      //         ContextsShape,
      //         LayersShape,
      //         ErrorsShape,
      //         Kind
      //       >,
      //       ...args: NormalizeArgs<
      //         [
      //           connectionOptions:
      //             | ConnectionObjectOptions<
      //                 Types,
      //                 Type,
      //                 false,
      //                 false,
      //                 ResolveReturnShape,
      //                 ConnectionInterfaces
      //               >
      //             | ObjectRef<
      //                 EffectPlugin.ShapeFromConnection<
      //                   ConnectionShapeHelper<
      //                     Types,
      //                     ShapeFromTypeParam<Types, Type, false>,
      //                     false
      //                   >
      //                 >
      //               >,
      //           edgeOptions:
      //             | ConnectionEdgeObjectOptions<
      //                 Types,
      //                 Type,
      //                 false,
      //                 ResolveReturnShape,
      //                 EdgeInterfaces
      //               >
      //             | ObjectRef<{
      //                 cursor: string;
      //                 node?:
      //                   | ShapeFromTypeParam<Types, Type, false>
      //                   | null
      //                   | undefined;
      //               }>,
      //         ],
      //         0
      //       >
      //     ) => FieldRef<
      //       EffectPlugin.ShapeFromConnection<
      //         ConnectionShapeHelper<
      //           Types,
      //           ShapeFromTypeParam<Types, Type, false>,
      //           Nullable
      //         >
      //       >
      //     >
      //   : '@pothos/plugin-relay is required to use this method';
    }

    // export type ConnectionShapeHelper<
    //   Types extends SchemaTypes,
    //   T,
    //   Nullable,
    // > = {};

    // export interface DefaultConnectionArguments {
    //   after?: null | string | undefined;
    //   before?: null | string | undefined;
    //   first?: null | number | undefined;
    //   last?: null | number | undefined;
    // }

    // export type ConnectionFieldOptions<
    //   Types extends SchemaTypes,
    //   ParentShape,
    //   Type extends OutputType<Types>,
    //   Nullable extends boolean,
    //   EdgeNullability extends FieldNullability<[unknown]>,
    //   NodeNullability extends boolean,
    //   Args extends InputFieldMap,
    //   ResolveReturnShape,
    // > = {};

    // export type ConnectionObjectOptions<
    //   Types extends SchemaTypes,
    //   Type extends OutputType<Types>,
    //   EdgeNullability extends FieldNullability<[unknown]>,
    //   NodeNullability extends boolean,
    //   Resolved,
    //   Interfaces extends InterfaceParam<Types>[] = [],
    // > = {};

    // export type ConnectionEdgeObjectOptions<
    //   Types extends SchemaTypes,
    //   Type extends OutputType<Types>,
    //   NodeNullability extends boolean,
    //   Resolved,
    //   Interfaces extends InterfaceParam<Types>[] = [],
    // > = {};
  }
}
