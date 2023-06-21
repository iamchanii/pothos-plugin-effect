import SchemaBuilder, { BasePlugin, SchemaTypes } from '@pothos/core';

import './field-builder.js';
import './global-types.js';

const pluginName = 'effect';

export default pluginName;

export class PothosEffectPlugin<Types extends SchemaTypes> extends BasePlugin<Types> {
}

SchemaBuilder.registerPlugin(pluginName, BasePlugin);
