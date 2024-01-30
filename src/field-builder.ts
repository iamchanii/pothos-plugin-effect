import { FieldKind, ObjectRef, RootFieldBuilder, SchemaTypes } from '@pothos/core';
import type { ConnectionShape } from '@pothos/plugin-relay';
import { Cause, Context, Effect, Exit, Function, Layer, Option, pipe } from 'effect';

import type { GraphQLResolveInfo } from 'graphql';
import type * as EffectPlugin from './';
import { PrismaClient } from '@pothos/plugin-prisma';
import { PothosEffectPrismaClient } from './prisma';

const fieldBuilderProto = RootFieldBuilder.prototype as PothosSchemaTypes.RootFieldBuilder<
  SchemaTypes,
  unknown,
  FieldKind
>;

// Check if result is a failure, if so, throw it.
// If custom FailErrorConstructor is provided, use it to throw error.
function checkAndThrowResultIfFailure<E, A>(
  result: Exit.Exit<E, A>,
  FailErrorConstructor: { new(message: string): unknown } = Error,
): asserts result is Exit.Success<E, A> {
  if (Exit.isFailure(result)) {
    const cause = result.cause;

    // TODO: shoud it handle empty/die/interrupt/etc cases?
    if (Cause.isFailType(cause) && (cause.error as unknown) instanceof Error) {
      throw cause.error;
    }

    throw new FailErrorConstructor(Cause.pretty(cause));
  }
}

// Handle success value(of Exit.Success)
// based on fields' options.nullable, return the mapped value.
function handleSuccessValue(
  value: any,
  nullable:
    | { items: boolean; list: boolean }
    | boolean
    | undefined,
): any {
  if (!nullable) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(Option.getOrElse(Function.constNull));
  }

  if (Option.isOption(value)) {
    return Option.match(value, {
      onNone: Function.constNull,
      onSome: (value) => {
        if (typeof nullable == 'object' && nullable.items && Array.isArray(value)) {
          return value.map(Option.getOrElse(Function.constNull));
        }

        return value;
      },
    });
  }

  throw new TypeError('Unreachable value is occured', { cause: value });
}

// Make a context for field effect.
function makeEffectContext(
  executionContext: any,
  globalContext: Context.Context<unknown> | undefined,
  contexts: readonly EffectPlugin.Context[] = [],
  services: readonly EffectPlugin.ServiceEntry[] = [],
  prismaClient: undefined | PrismaClient | ((ctx: {}) => PrismaClient) = undefined,
) {
  // If provided, use global context or use empty context
  let context = globalContext ?? Context.empty();

  // Merge provided field contexts
  contexts.forEach((nextContextOrContextFunction) => {
    const nextContext = typeof nextContextOrContextFunction === 'function'
      ? nextContextOrContextFunction(executionContext)
      : nextContextOrContextFunction;

    context = Context.merge(context, nextContext);
  }, context);

  // Add provided field service entries. (entry is a tuple of [tag, service])
  services.forEach(([tag, nextServiceOrServiceFunction]) => {
    const nextService = typeof nextServiceOrServiceFunction === 'function'
      ? nextServiceOrServiceFunction(executionContext)
      : nextServiceOrServiceFunction;

    context = Context.add(context, tag, nextService);
  }, context);

  // Add prisma client to context if provided
  if (prismaClient) {
    const client = typeof prismaClient === 'function'
      ? prismaClient(executionContext)
      : prismaClient;

    context = Context.add(context, PothosEffectPrismaClient, client as never);
  }

  return context;
}

// Make a layer for field effect.
function makeEffectLayer(
  executionContext: any,
  globalLayer: Layer.Layer<unknown, never, unknown> | undefined,
  layers: readonly EffectPlugin.Layer[] = [],
) {
  // If provided, use global layer or use empty layer
  let layer = globalLayer ?? Layer.context();

  // Provide all provided field layers
  layers.forEach((nextLayerOrLayerFunction) => {
    const nextLayer = typeof nextLayerOrLayerFunction === 'function'
      ? nextLayerOrLayerFunction(executionContext)
      : nextLayerOrLayerFunction;

    layer = Layer.provide(layer, nextLayer) as any;
  });

  return layer as unknown as Layer.Layer<never, never, never>;
}

async function resolveEffectField(
  this: typeof fieldBuilderProto,
  fieldResult: any,
  executionContext: any,
  effect: EffectPlugin.FieldEffectOptions,
  nullable: any,
) {
  const effectOptions = this.builder.options.effectOptions;

  // Make effect context and layer
  const context = makeEffectContext(
    executionContext,
    effectOptions?.globalContext,
    effect.contexts,
    effect.services,
    this.builder.options.prisma?.client,
  );
  const layer = makeEffectLayer(executionContext, effectOptions?.globalLayer, effect.layers);

  // Provide layer and context to resolve field effect
  const program = pipe(
    fieldResult as Effect.Effect<never, never, any>,
    Effect.provide(layer),
    Effect.provide(context),
  );

  // Run effect via runPromiseExit to handle error or success value
  const result = await Effect.runPromiseExit(program);

  // Check if result is a failure, if so, throw it.
  checkAndThrowResultIfFailure(result, effect.failErrorConstructor || effectOptions?.defaultFailErrorConstructor);

  // Or not, handle success value
  return handleSuccessValue(result.value, nullable);
}

fieldBuilderProto.effect = function effect({ effect = {}, resolve, ...options }) {
  return this.field({
    ...options,
    resolve: ((parent: any, args: any, context: {}, info: GraphQLResolveInfo) => {
      return resolveEffectField.call(
        this,
        resolve(parent, args, context, info),
        context,
        effect,
        options.nullable,
      );
    }) as never,
  });
};

fieldBuilderProto.effectConnection = function connection(
  { edgesNullable, nodeNullable, type, ...fieldOptions },
  connectionOptionsOrRef = {} as never,
  edgeOptionsOrRef = {} as never,
) {
  const connectionRef = connectionOptionsOrRef instanceof ObjectRef
    ? connectionOptionsOrRef
    : this.builder.objectRef<ConnectionShape<SchemaTypes, unknown, boolean>>(
      'Unnamed connection',
    );

  const fieldRef = this.effect({
    ...this.builder.options.relayOptions?.defaultConnectionFieldOptions,
    ...fieldOptions,
    args: {
      ...fieldOptions.args,
      ...this.arg.connectionArgs(),
    },
    resolve: fieldOptions.resolve as never,
    type: connectionRef,
  } as never);

  if (!(connectionOptionsOrRef instanceof ObjectRef)) {
    this.builder.configStore.onFieldUse(fieldRef, (fieldConfig) => {
      const connectionName = connectionOptionsOrRef.name
        ?? `${this.typename}${capitalize(fieldConfig.name)}${
          fieldConfig.name.toLowerCase().endsWith('connection') ? '' : 'Connection'
        }`;

      this.builder.connectionObject(
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

      this.builder.configStore.associateRefWithName(connectionRef, connectionName);
    });
  }

  return fieldRef as never;
};

export function capitalize(s: string) {
  return `${s.slice(0, 1).toUpperCase()}${s.slice(1)}`;
}

fieldBuilderProto.prismaEffect = function prismaEffect({ effect = {}, resolve, ...options }) {
  return this.prismaField({
    ...options,
    resolve: ((query: any, parent: any, args: any, context: {}, info: GraphQLResolveInfo) => {
      return resolveEffectField.call(
        this,
        resolve(query, parent, args, context, info),
        context,
        effect,
        options.nullable,
      );
    }) as never,
  });
};
