import SchemaBuilder, { BasePlugin, type SchemaTypes } from '@pothos/core';
import './field-builder.js';
import './global-types.js';

const pluginName = 'effect';

export default pluginName;

export class EffectPlugin<
  Types extends SchemaTypes,
> extends BasePlugin<Types> {}

SchemaBuilder.registerPlugin(pluginName, EffectPlugin);

export * from './types.js';
