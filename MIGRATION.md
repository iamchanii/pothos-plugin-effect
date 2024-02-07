# Migration from v0.x

The 1.0 release contains a large number of breaking changes. If you're using pothos-plugin-effect@0.x (thanksfully), follow the instructions below.

## `t.effect` is not field builder.

`t.effect` is provided as a utility function rather than in the field builder. Use `t.effect` inside any kind of Pothos field resolver function to resolve the Effect.

```ts
t.int({
  resolve: () => t.effect(Effect.succeed(1)),
});
```

## Removed service/context/layer configuration options at field level.

Instead, you can [configure a custom effect runtime](/README.md#configure-custom-runtime).

## Removed `t.effectConnection`

Instead, you can directly use the `resolveArrayConnection`/`resolveCursorConnection`/`resolveOffsetConnection` which imported from [`@pothos/plugin-relay`](https://pothos-graphql.dev/docs/plugins/relay), with `t.effect`. Below is an example code for using `resolveArrayConnection`:

```ts
t.connection({
  type: "String",
  resolve: async (_root, args) => {
    return resolveArrayConnection(
      { args },
      await t.effect(Effect.succeed(["1", "2", "3", "4"]))
    );
  },
});
```

## Removed `t.prismaEffect` (aka Prisma Integration)

`t.effect` works even if the end result of the Effect is a Promise.

```ts
t.prismaField({
  type: "User",
  resolve: (query) =>
    t.effect(
      pipe(
        PrismaClient,
        Effect.map((prisma) => prisma.user.findFirstOrThrow({ ...query }))
      )
    ),
});
```

## Removed error type inferring

Removed `errors.types` inference functionality provided by integration with the errors plugin.
