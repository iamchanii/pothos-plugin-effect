import { Context, Effect, Layer, pipe } from 'effect';

import { Fetch } from './Fetch';

export class NotFound {
  readonly _tag = 'NotFound';
}

export interface GitHubUser {
  followers: number;
  name: string;
}

export interface GitHub {
  getUser(username: string): Effect.Effect<never, NotFound, GitHubUser>;
}

export const GitHub = Context.Tag<GitHub>();

export const GitHubLive = Layer.effect(
  GitHub,
  pipe(
    Fetch,
    Effect.map(fetch =>
      GitHub.of({
        getUser: username =>
          pipe(
            fetch.get(`https://api.github.com/users/${username}`),
            Effect.flatMap(response => Effect.promise(() => response.json() as Promise<GitHubUser>)),
            Effect.catchTag('RequestError', () => Effect.fail(new NotFound())),
          ),
      })
    ),
  ),
);

export const GitHubStub = Layer.succeed(
  GitHub,
  GitHub.of({
    getUser: username => Effect.succeed({ followers: 10_000_000, name: username }),
  }),
);
