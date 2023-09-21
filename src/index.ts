import SchemaBuilder, { BasePlugin, SchemaTypes } from '@pothos/core';

import './field-builder';
import './global-types';

export * from './types';

const pluginName = 'effect';

export default pluginName;
export class EffectPlugin<Types extends SchemaTypes> extends BasePlugin<Types> {
}

SchemaBuilder.registerPlugin(pluginName, EffectPlugin);
