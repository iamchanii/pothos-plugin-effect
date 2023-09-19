# Integration with Prisma Plugin

If you're using Prisma Plugin, you can use `t.prismaEffect` method and querying database using Prisma with optimized query.

```ts
builder.queryField('user', t =>
  t.prismaEffect({
    type: 'User',
    resolve() {
      // $ExpectType Effect.Effect<never, BaseError, never>
      return Effect.promise(() =>
        prisma.user.findUniqueOrThrow({
          ...query,
          where: { id: 1 },
        })
      );
    },
  }));
```

---

**Previous**: [Integration with Prisma Plugin](./05-integration-with-prisma-plugin.md)
