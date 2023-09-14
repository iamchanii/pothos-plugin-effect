import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import { Effect, pipe } from 'effect';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import EffectPlugin from 'pothos-plugin-effect';

import { FetchLive } from './Fetch';
import { ForbiddenUser, GitHub, GitHubLive, NotFound } from './GitHub';

const builder = new SchemaBuilder({
  plugins: [ErrorsPlugin, EffectPlugin],
});

const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

builder.objectType(Error, {
  interfaces: [ErrorInterface],
  name: 'BaseError',
});

builder.objectType(NotFound, {
  interfaces: [ErrorInterface],
  name: 'NotFound',
});

builder.objectType(ForbiddenUser, {
  interfaces: [ErrorInterface],
  name: 'ForbiddenUser',
});

builder.queryType({
  fields: t => ({
    githubUserFollowers: t.effect({
      args: {
        username: t.arg.string({ required: true }),
      },
      effect: {
        layers: [FetchLive, GitHubLive],
      },
      errors: {
        types: [NotFound, ForbiddenUser],
      },
      resolve: (_parent, args) =>
        pipe(
          GitHub,
          Effect.flatMap(github => github.getUser(args.username)),
          Effect.map(user => user.followers),
        ),
      type: 'Int',
    }),
  }),
});

const schema = builder.toSchema({ sortSchema: true });

const yoga = createYoga({ schema });

const server = createServer(yoga);

server.listen(4000, () => {
  console.info('Server is running on http://localhost:4000/graphql');
});
