# Migration from v0.x

The 1.0 release contains a large number of breaking changes. If you're using pothos-plugin-effect from 0.x (thanksfully), follow the instructions below.

## `t.effect` is not field builder.

`t.effect` is provided as a utility function rather than in the field builder. Use `t.effect` inside any kind of Pothos field resolver function to resolve the Effect.

<table>
<thead>
<tr>
<th><code>Before (0.x)</code></th>
<th><code>After (1.0.0 ~)</code></th>
</thead>
<tbody>
<tr>
<td>

```ts
t.effect({
  type: "Int",
  effect: {},
  resolve: () => Effect.succeed(1),
});
```

</td>
<td>

```ts
t.int({
  resolve: () => t.effect(Effect.succeed(1)),
});

t.string({
  resolve: () => t.effect(Effect.succeed("Hello, World!")),
});

t.field({
  type: "Float",
  nullable: true,
  resolve: () => t.effect(Effect.succeedNone),
});
```

</td>
</tr>
</tbody>
</table>

## Removed service/context/layer configuration options at field level.

Instead, you can [configure a custom effect runtime](./README.md#configure-custom-runtime).

<table>
<thead>
<tr>
<th><code>Before (0.x)</code></th>
<th><code>After (1.0.0 ~)</code></th>
</thead>
<tbody>
<tr>
<td>

```ts
t.effect({
  type: User,
  effect: {
    services: [
      UserService,
      UserService.of({
        /* ... */
      }),
    ],
    contexts: [
      /* ... */
    ],
    layers: [
      /* ... */
    ],
  },
  resolve: () =>
    Effect.gen(function* (_) {
      const userService = yield* _(UserService);

      return yield* _(userService.getUserOrThrow());
    }),
});
```

</td>
<td>

```ts
declare const effectRuntime: Runtime.Runtime<UserService>;

const builder = new SchemaBuilder<{
  EffectRuntime: typeof effectRuntime;
}>({
  plugins: [EffectPlugin],
  effectOptions: { effectRuntime },
});

// in builder:

t.field({
  type: User,
  resolve: () =>
    t.effect(
      Effect.gen(function* (_) {
        const userService = yield* _(UserService);

        return yield* _(userService.getUserOrThrow());
      })
    ),
});
```

</td>
</tr>
</tbody>
</table>

## Removed `t.effectConnection`

Instead, you can directly use the `resolveArrayConnection`/`resolveCursorConnection`/`resolveOffsetConnection` which imported from [`@pothos/plugin-relay`](https://pothos-graphql.dev/docs/plugins/relay), with `t.effect`. Below is an example code for using `resolveArrayConnection`:

<table>
<thead>
<tr>
<th><code>Before (0.x)</code></th>
<th><code>After (1.0.0 ~)</code></th>
</thead>
<tbody>
<tr>
<td>

```ts
t.effectConnection({
  type: "Int",
  effect: {
    /* ... */
  },
  resolve: () => Effect.succeed([1, 2, 3, 4]),
});
```

</td>
<td>

```ts
t.connection({
  type: "Int",
  resolve: async (_root, args) =>
    resolveArrayConnection(
      { args },
      await t.effect(Effect.succeed([1, 2, 3, 4]))
    ),
});

t.connection({
  type: "Int",
  resolve: async (_root, args) =>
    resolveCursorConnection(
      { args, toCursor: (id) => id },
      (_params) => t.effect(Effect.succeed([1, 2, 3, 4]))
    ),
});

t.connection({
  type: "Int",
  resolve: async (_root, args) =>
    resolveOffsetConnection({ args }, (_params) =>
      t.effect(Effect.succeed([1, 2, 3, 4]))
    ),
});
```

</td>
</tr>
</tbody>
</table>

## Removed `t.prismaEffect` (aka Prisma Integration)

`t.effect` works even if the end result of the Effect is a Promise.

<table>
<thead>
<tr>
<th><code>Before (0.x)</code></th>
<th><code>After (1.0.0 ~)</code></th>
</thead>
<tbody>
<tr>
<td>

```ts
t.prismaEffect({
  type: "User",
  effect: {
    /* ... */
  },
  resolve: (query) =>
    PrismaEffect.user.findFirstOrThrow({
      ...query,
    }),
});
```

</td>
<td>

```ts
t.prismaField({
  type: "User",
  resolve: (query) =>
    t.effect(
      Effect.succeed(
        prisma.user.findFirstOrThrow({
          ...query,
        })
      )
    ),
});
```

</td>
</tr>
</tbody>
</table>

## Removed error type inferring

Removed `errors.types` inference functionality provided by integration with the errors plugin.
