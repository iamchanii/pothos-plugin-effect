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
- [Integration with Relay Plugin](./docs/03-integration-with-relay-plugin.md)
- [Integration with Errors Plugin](./docs/04-integration-with-errors-plugin.md)
- [Integration with Prisma Plugin](./docs/05-integration-with-prisma-plugin.md)

## Acknowledges

- Pothos by [@hayes](https://github.com/hayes) ([GitHub](https://github.com/hayes/pothos)/[Docs](https://pothos-graphql.dev/)) - A nice GraphQL Schema builder. I heavily relied on the README for this project and The documentation of the plugin implementation is excellent.
- Effect ([GitHub](https://github.com/effect-TS/)/[Docs](https://effect.website/))

## Contributors

<a href="https://github.com/iamchanii/pothos-plugin-effect/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=iamchanii/pothos-plugin-effect" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Licenses

MIT
