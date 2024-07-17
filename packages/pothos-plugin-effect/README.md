# pothos-plugin-effect

✨ _Perfect_ ✨ combination of [Pothos GraphQL](https://pothos-graphql.dev/) and [Effect](https://effect.website/). This powerful combination will take your GraphQL development experience to the next level!

```typescript
import EffectPlugin from "pothos-plugin-effect";
import { Random } from "effect";

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});

builder.queryFields((t) => ({
  roll: t.effect({
    type: "Int",
    resolve: () => Random.nextIntBetween(1, 6),
  }),
}));
```

## Installtation

```
$ yarn add effect pothos-plugin-effect
```

## Documentation

No friendly documentation is currently available, but you can check out the test code below to see how it works in action:

- [Adding and configuring plugins to `SchemaBuilder`](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/builder.ts#L9-L23)
- [Adding a field using `t.effect`](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/base.ts)
- [Using with the Errors plugin](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/error.ts)
- [Using with the With-Input plugin](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/withInput.ts)
- [Using with the Prisma](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/prisma.ts)
- [Using with the Drizzle](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/drizzle.ts)
- [Adding a subscription field using `Stream`](https://github.com/iamchanii/pothos-plugin-effect/blob/main/packages/pothos-plugin-effect/tests/schema/stream.ts#L11)

## Requirements

- `@pothos/core^4`
- `effect>=3.0.0`

## Acknowledges

- Pothos by [@hayes](https://github.com/hayes) ([GitHub](https://github.com/hayes/pothos)/[Docs](https://pothos-graphql.dev/)) - A nice GraphQL Schema builder. I heavily relied on the README for this project and The documentation of the plugin implementation is excellent.
- Effect ([GitHub](https://github.com/effect-TS/)/[Docs](https://effect.website/)) - This is a pretty amazing growth trend. A library that has the charm to bring you back. (including me, of course)

## Contributors

<a href="https://github.com/iamchanii/pothos-plugin-effect/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=iamchanii/pothos-plugin-effect" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## License

MIT
