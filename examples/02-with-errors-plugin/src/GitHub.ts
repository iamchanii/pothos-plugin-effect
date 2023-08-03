import { Context, Effect, Layer, pipe } from 'effect';

import { Fetch } from './Fetch.js';

export class NotFound extends Error {
  readonly _tag = 'NotFound';

  constructor(username: string) {
    super(`User ${username} not found`);

    this.name = 'NotFound';
  }
}

export class ForbiddenUser extends Error {
  readonly _tag = 'ForbiddenUser';

  constructor(username: string) {
    super(`User ${username} is forbidden`);

    this.name = 'ForbiddenUser';
  }
}

export interface GitHubUser {
  followers: number;
  name: string;
}

export interface GitHub {
  getUser(username: string): Effect.Effect<never, ForbiddenUser | NotFound, GitHubUser>;
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
            username === 'admin',
            Effect.if({
              onTrue: Effect.fail(new ForbiddenUser(username)),
              onFalse: Effect.succeed(username),
            }),
            Effect.flatMap(username => fetch.get(`https://api.github.com/users/${username}`)),
            Effect.flatMap(response => Effect.promise(() => response.json() as Promise<GitHubUser>)),
            Effect.catchTag('RequestError', () => Effect.fail(new NotFound(username))),
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
