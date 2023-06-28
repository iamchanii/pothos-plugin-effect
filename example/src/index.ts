import { pipe } from '@effect/data/Function';
import * as Effect from '@effect/io/Effect';
import SchemaBuilder from '@pothos/core';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'node:http';
import EffectPlugin from 'pothos-plugin-effect';

import { Dice } from './Dice.js';
import { FetchLive } from './Fetch.js';
import { GitHub, GitHubLive, GitHubStub } from './GitHub.js';

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
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
      resolve: (_parent, args) =>
        pipe(
          GitHub,
          Effect.flatMap(github => github.getUser(args.username)),
          Effect.map(user => user.followers),
          Effect.catchTag('NotFound', () => Effect.succeed(0)),
        ),
      type: 'Int',
    }),

    roll: t.effect({
      effect: {
        services: [
          [
            Dice,
            Dice.of({
              roll: () => Effect.succeed(Math.floor(Math.random() * 6) + 1),
            }),
          ],
        ],
      },
      resolve: () =>
        pipe(
          Dice,
          Effect.flatMap(dice => dice.roll()),
        ),
      type: 'Int',
    }),

    stubGithubUserFollowers: t.effect({
      args: {
        username: t.arg.string({ required: true }),
      },
      effect: {
        layers: [FetchLive, GitHubStub],
      },
      resolve: (_parent, args) =>
        pipe(
          GitHub,
          Effect.flatMap(github => github.getUser(String(args.username))),
          Effect.map(user => user.followers),
          Effect.catchTag('NotFound', () => Effect.succeed(0)),
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
