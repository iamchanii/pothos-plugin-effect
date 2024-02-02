import type {
  FieldKind,
  FieldRef,
  InputFieldMap,
  InterfaceParam,
  NormalizeArgs,
  OutputType,
  PluginName,
  SchemaTypes,
  ShapeFromTypeParam,
} from '@pothos/core';
import type * as Types from './types.js';
import { ErrorConstructor } from '../core/types.js';

declare global {
  export namespace PothosSchemaTypes {
    export interface RootFieldBuilder<
      Types extends SchemaTypes,
      ParentShape,
      Kind extends FieldKind = FieldKind,
    > {
      effectConnection: 'relay' extends PluginName
        ? <
            Type extends OutputType<Types>,
            Nullable extends boolean,
            ResolveReturnShape,
            // Effect Types:
            ErrorTypes extends [...ErrorConstructor[]],
            // Relay Types:
            Args extends InputFieldMap = {},
            ConnectionInterfaces extends InterfaceParam<Types>[] = [],
            EdgeInterfaces extends InterfaceParam<Types>[] = [],
          >(
            options: Types.ConnectionFieldOptions<
              Types,
              ParentShape,
              Args,
              Type,
              Nullable,
              ResolveReturnShape,
              ErrorTypes,
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
                      Types.ShapeFromConnection<
                        ConnectionShapeHelper<
                          Types,
                          ShapeFromTypeParam<Types, Type, false>,
                          false
                        >
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
                      node?:
                        | ShapeFromTypeParam<Types, Type, false>
                        | null
                        | undefined;
                    }>,
              ],
              0
            >
          ) => FieldRef<
            Types.ShapeFromConnection<
              ConnectionShapeHelper<
                Types,
                ShapeFromTypeParam<Types, Type, false>,
                Nullable
              >
            >
          >
        : '@pothos/plugin-relay is required to use this method';
    }
  }
}
