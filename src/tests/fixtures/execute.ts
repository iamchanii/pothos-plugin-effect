import SchemaBuilder from '@pothos/core';
import { execute as execute_, parse } from 'graphql';

export function execute(
  builder: InstanceType<typeof SchemaBuilder<any>>,
  source: string,
  contextValue = {},
) {
  const schema = builder.toSchema();
  const document = parse(source);

  return execute_({ document, schema, contextValue });
}
