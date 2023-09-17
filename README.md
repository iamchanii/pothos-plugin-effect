# pothos-plugin-effect

Seamless integration between the [Pothos GraphQL](https://pothos-graphql.dev/) and [Effect](https://effect.website/).

## Hello World!

```typescript
import SchemaBuilder from '@pothos/core';
import EffectPlugin from 'pothos-plugin-effect';
import { Effect, Random } from 'effect';

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});

builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    resolve() {
      // $ExpectType Effect.Effect<never, never, number>
      return Random.nextIntBetween(1, 6);
    },
  }),
}));
```

## Documentations

- [Getting Started](./docs/01-getting-started.md)
- [Context Management](./docs/02-context-management.md)
- Integrations
  - Relay Plugin
  - Errors Plugin
  - Prisma Plugin

## Acknowledges

- Pothos by [@hayes](https://github.com/hayes) ([GitHub](https://github.com/hayes/pothos)/[Docs](https://pothos-graphql.dev/)) - A nice GraphQL Schema builder. I heavily relied on the README for this project and The documentation of the plugin implementation is excellent.
- Effect ([GitHub](https://github.com/effect-TS/)/[Docs](https://effect.website/))

## Licenses

MIT
