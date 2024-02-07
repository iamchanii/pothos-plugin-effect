# pothos-plugin-effect

<img src="https://img.shields.io/badge/-Biome-60A5FA?logo=biome&logoColor=white" /> [![codecov](https://codecov.io/gh/iamchanii/pothos-plugin-effect/graph/badge.svg?token=J232OH6YD2)](https://codecov.io/gh/iamchanii/pothos-plugin-effect)

Seamless integration between the [Pothos GraphQL](https://pothos-graphql.dev/) and [Effect](https://effect.website/).

## Getting Started

You can use `Effect.Effect<R, E, A>` within resolver functions using `t.effect`. and that's it.

```ts
import EffectPlugin from "pothos-plugin-effect";

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});

builder.queryFields((t) => ({
  roll: t.int({
    resolve: () => t.effect(Effect.succeed(6)),
  }),
}));
```

## Installtation

Install `pothos-effect-plugin` and `effect`. Effect is a peer-dependency.

```
yarn add pothos-plugin-effect effect
```

## Requirements

- `@pothos/core^3`
- `effect>=2.2.0`

## Key Features

- 🪄 Ridiculously simple API, the only thing added is `t.effect`.
- 🌿 Can be used by any Pothos field resolver.
- 📦 Supports [Option](https://effect.website/docs/data-types/option) data type.
- ⚙️ Custom [Runtime](https://effect.website/docs/runtime) can be configured.
- ⏳ Promise objects can be used as result values.
- ✅ Well-written test cases

## Guide

### Using with Option data types

`t.effect` returns the given `Option.Option<T>` data by converting its value to `(T | null)`. This is useful for creating fields that are nullable, while actively using the [Option](https://effect.website/docs/data-types/option) data type in Effect.

```tsx
t.effect(Effect.succeed(1));
// ^? Promise<number>

t.effect(Effect.succeedSome(1));
// ^? Promise<number | null>

t.effect(
  Effect.succeedSome([
    //
    Option.some(1),
    Option.none(),
    Option.some(3),
  ])
);
// ^? Promise<(number | null)[] | null>
```

### Configure Custom Runtime

You can configure a custom runtime when you configure `SchemaBuilder`.

```tsx
const effectRuntime = await Effect.runPromise(
  Layer.toRuntime(AppLayerLive).pipe(Scope.extend(scope))
);

const builder = new SchemaBuilder<{
  EffectRuntime: typeof effectRuntime;
}>({
  plugins: [EffectPlugin],
  effectOptions: { effectRuntime },
});

builder.queryFields((t) => ({
  user: t.field({
    type: User,
    resolve: () =>
      t.effect(
        pipe(
          UserService,
          Effect.flatMap((userService) => userService.getUser(1))
        )
      ),
  }),
}));
```

### Promises can be used as Effect result

By default, you can't use promises directly in Effect; you need to convert them to Effect via [Effect.tryPromise](https://effect.website/docs/essentials/creating#effecttrypromise). However, promises are available by default within GraphQL resolvers.

If `t.effect` returns a Promise from an Effect, it will return that Promise as the result, making it available for use within the resolver. It will also correctly infer the type of the Promise.

This is useful when using an ORM like [Prisma](https://www.prisma.io/) or [Drizzle](https://orm.drizzle.team/) with it.

```ts
t.effect(Effect.succeed(Promise.resolve({ id: 1, name: "John" })));
// ^? Promise<{ id: number; name: string; }>
```

### Well-written test cases

When I rewrote this library, I put a lot of effort into the test cases. You can find test cases for the core functionality of the library, as well as simple E2E test cases.

## Acknowledges

- Pothos by [@hayes](https://github.com/hayes) ([GitHub](https://github.com/hayes/pothos)/[Docs](https://pothos-graphql.dev/)) - A nice GraphQL Schema builder. I heavily relied on the README for this project and The documentation of the plugin implementation is excellent.
- Effect ([GitHub](https://github.com/effect-TS/)/[Docs](https://effect.website/)) - This is a pretty amazing growth trend. A library that has the charm to bring you back. (including me, of course)

## Contributors

<a href="https://github.com/iamchanii/pothos-plugin-effect/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=iamchanii/pothos-plugin-effect" />
</a>

Made with [contrib.rocks](https://contrib.rocks).

## Licenses

MIT
