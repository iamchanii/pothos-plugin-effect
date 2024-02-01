import {
  FieldKind,
  // ObjectRef,
  RootFieldBuilder,
  SchemaTypes,
} from '@pothos/core';
// import type { ConnectionShape } from '@pothos/plugin-relay';
// import { Cause, Context, Effect, Exit, Layer, Option, pipe } from 'effect';
// import { PrismaClient } from '@pothos/plugin-prisma';
// import type { GraphQLResolveInfo } from 'graphql';
// import type * as EffectPlugin from './index.js';
import { runEffectFieldResult } from './libs/runEffectFieldResult.js';
import invariant from 'tiny-invariant';

const fieldBuilderProto =
  RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
    SchemaTypes,
    unknown,
    FieldKind
  >;

fieldBuilderProto.effect = function effect({ resolve, ...options }) {
  const effectRuntime = this.builder.options.effectOptions?.effectRuntime;
  invariant(
    effectRuntime,
    'builder.options.effectOptions.effectRuntime must be provided.',
  );

  return this.field({
    ...options,
    resolve(parent: any, args: any, context: any, info: any) {
      const effectFieldResult = resolve(parent, args, context, info);

      return runEffectFieldResult(effectFieldResult, effectRuntime) as never;
    },
  });
};

// fieldBuilderProto.effectConnection = function connection(
//   { edgesNullable, nodeNullable, type, ...fieldOptions },
//   connectionOptionsOrRef = {} as never,
//   edgeOptionsOrRef = {} as never,
// ) {
//   const connectionRef =
//     connectionOptionsOrRef instanceof ObjectRef
//       ? connectionOptionsOrRef
//       : this.builder.objectRef<ConnectionShape<SchemaTypes, unknown, boolean>>(
//           'Unnamed connection',
//         );

//   const fieldRef = this.effect({
//     ...this.builder.options.relayOptions?.defaultConnectionFieldOptions,
//     ...fieldOptions,
//     args: {
//       ...fieldOptions.args,
//       ...this.arg.connectionArgs(),
//     },
//     resolve: fieldOptions.resolve as never,
//     type: connectionRef,
//   } as never);

//   if (!(connectionOptionsOrRef instanceof ObjectRef)) {
//     this.builder.configStore.onFieldUse(fieldRef, (fieldConfig) => {
//       const connectionName =
//         connectionOptionsOrRef.name ??
//         `${this.typename}${capitalize(fieldConfig.name)}${
//           fieldConfig.name.toLowerCase().endsWith('connection')
//             ? ''
//             : 'Connection'
//         }`;

//       this.builder.connectionObject(
//         {
//           edgesNullable,
//           nodeNullable,
//           type,
//           ...connectionOptionsOrRef,
//           name: connectionName,
//         },
//         edgeOptionsOrRef instanceof ObjectRef
//           ? edgeOptionsOrRef
//           : {
//               name: `${connectionName}Edge`,
//               ...edgeOptionsOrRef,
//             },
//       );

//       this.builder.configStore.associateRefWithName(
//         connectionRef,
//         connectionName,
//       );
//     });
//   }

//   return fieldRef as never;
// };

// export function capitalize(s: string) {
//   return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
// }

// fieldBuilderProto.prismaEffect = function prismaEffect({
//   effect = {},
//   resolve,
//   ...options
// }) {
//   return this.prismaField({
//     ...options,
//     resolve: ((
//       query: any,
//       parent: any,
//       args: any,
//       context: {},
//       info: GraphQLResolveInfo,
//     ) => {
//       return resolveEffectField.call(
//         this,
//         resolve(query, parent, args, context, info),
//         context,
//         effect,
//         options.nullable,
//       );
//     }) as never,
//   });
// };
