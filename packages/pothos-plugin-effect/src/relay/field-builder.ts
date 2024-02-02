import {
  FieldKind,
  ObjectRef,
  RootFieldBuilder,
  SchemaTypes,
} from '@pothos/core';
import { Runtime } from 'effect';
import { capitalize } from 'effect/String';
import invariant from 'tiny-invariant';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.effectConnection = function connection(
  { edgesNullable, nodeNullable, type, ...fieldOptions },
  connectionOptionsOrRef = {} as never,
  edgeOptionsOrRef = {} as never,
) {
  const effectRuntime =
    this.builder.options.effectOptions?.effectRuntime ?? Runtime.defaultRuntime;

  const connectionRef =
    connectionOptionsOrRef instanceof ObjectRef
      ? connectionOptionsOrRef
      : this.builder.objectRef<
          import('@pothos/plugin-relay').ConnectionShape<
            SchemaTypes,
            unknown,
            boolean
          >
        >('Unnamed connection');

  const fieldRef = this.effect({
    ...this.builder.options.relayOptions?.defaultConnectionFieldOptions,
    ...fieldOptions,
    args: {
      ...fieldOptions.args,
      ...this.arg.connectionArgs(),
    },
    type: connectionRef,
    resolve: fieldOptions.resolve,
  } as never);

  if (!(connectionOptionsOrRef instanceof ObjectRef)) {
    this.builder.configStore.onFieldUse(fieldRef, (fieldConfig) => {
      const connectionName =
        connectionOptionsOrRef.name ??
        `${this.typename}${capitalize(fieldConfig.name)}${
          fieldConfig.name.toLowerCase().endsWith('connection')
            ? ''
            : 'Connection'
        }`;

      this.builder.connectionObject(
        // @ts-expect-error
        {
          edgesNullable,
          nodeNullable,
          type,
          ...connectionOptionsOrRef,
          name: connectionName,
        },
        edgeOptionsOrRef instanceof ObjectRef
          ? edgeOptionsOrRef
          : {
              name: `${connectionName}Edge`,
              ...edgeOptionsOrRef,
            },
      );
      this.builder.configStore.associateRefWithName(
        connectionRef,
        connectionName,
      );
    });
  }

  return fieldRef as never;
};
