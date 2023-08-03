import { Context, Effect, Layer, pipe } from 'effect';

export class RequestError {
  readonly _tag = 'RequestError';
  constructor(readonly response: Response | null) {}
}

export interface Fetch {
  get(input: RequestInfo | URL, init?: RequestInit | undefined): Effect.Effect<never, RequestError, Response>;
}

export const Fetch = Context.Tag<Fetch>();

export const FetchLive = Layer.succeed(
  Fetch,
  Fetch.of({
    get: (input, init) =>
      pipe(
        Effect.tryPromise({
          try: () => fetch(input, init),
          catch: () => new RequestError(null),
        }),
        Effect.flatMap(response =>
          response.ok
            ? Effect.succeed(response)
            : Effect.fail(new RequestError(response))
        ),
      ),
  }),
);
