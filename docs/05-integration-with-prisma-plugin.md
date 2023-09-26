# Integration with Prisma Plugin

If you're using Prisma Plugin, you can use `t.prismaEffect` method and querying database using Prisma with optimized query.

```ts
import { PrismaEffect } from 'pothos-plugin-effect/prisma';

builder.queryField('user', t =>
  t.prismaEffect({
    type: 'User',
    resolve(query) {
      // $ExpectType Effect.Effect<never, never, User>
      return PrismaEffect.user.findUniqueOrThrow({
        ...query,
        where: { id: 1 },
      });
    },
  }));
```

## Setup

Add a `effect` generator to your prisma schema

```prisma
generator effect {
  provider = "pothos-plugin-effect"
}
```

Then, run the following command to generate codes and types:

```
pnpm prisma generate
```

## Use `PrismaEffect`

Now you can import `PrismaEffect` which is both a interface and an object from `pothos-plugin-effect/prisma`.

```ts
// $ExpectType Effect.Effect<never, never, User>
PrismaEffect.user.findUniqueOrThrow({});
```

Other fields that can return `null` are provided as `Option.Option<T>` types. consider making field nullable.

```ts
import { PrismaEffect } from 'pothos-plugin-effect/prisma';

builder.queryField('user', t =>
  t.prismaEffect({
    type: 'User',
    nullable: true,
    resolve(query) {
      // $ExpectType Effect.Effect<never, never, Option.Option<User>>
      return PrismaEffect.user.findUnique({
        ...query,
        where: { id: 1 },
      });
    },
  }));
```

`PrismaEffect` is a subset implementation of `PrismaClient`. If you want to use other methods, consider opening a issue or contributing.

---

**Previous**: [Integration with Prisma Plugin](./05-integration-with-prisma-plugin.md)
