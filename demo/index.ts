import * as Effect from '@effect/io/Effect';
import EffectPlugin from '@imchhh/pothos-plugin-effect';
import SchemaBuilder from '@pothos/core';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});

builder.queryType({});

const Test = builder.objectRef<{ name: string }>('Test').implement({
  fields: t => ({
    name: t.exposeString('name'),
  }),
});

builder.queryFields(t => ({
  ping: t.field({
    resolve: () => 'pong',
    type: 'String',
  }),
  pingEffect: t.effect({
    resolve: () => {
      return Effect.succeed({ name: 'test11111' });
    },
    type: Test,
  }),
}));

const schema = builder.toSchema();

const yoga = createYoga({ schema });

const server = createServer(yoga);

server.listen(43000);
