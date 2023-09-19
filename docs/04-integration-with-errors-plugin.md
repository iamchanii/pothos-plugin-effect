# Integration with Errors Plugin

If you're using Errors Plugin, you can more easily represent error types with Effect.

```ts
builder.queryField('totalUserCount', t =>
  t.effect({
    type: 'String',
    errors: {
      types: [BaseError],
    },
    resolve() {
      // $ExpectType Effect.Effect<never, BaseError, never>
      return Effect.fail(new BaseError('403 Forbidden'));
    },
  }));
```

Based on the example above, you'll get `QueryTotalUserCountResult` union type consisting of `QueryTotalUserCountSuccess` and `BaseError`.

---

**Previous**: [Integration with Relay Plugin](./03-integration-with-relay-plugin.md)

**Next**: [Integration with Prisma Plugin](./05-integration-with-prisma-plugin.md)
