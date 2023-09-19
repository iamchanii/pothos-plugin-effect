# Integration with Relay Plugin

If you're using Relay Plugin, you can use `t.effectConnection` method to represent connection field with Effect.

```ts
import { resolveArrayConnection } from '@pothos/plugin-relay';

builder.queryFields(t => ({
  exampleConnection: t.effectConnection({
    type: 'Int',
    resolve() {
      return Effect.succeed(
        resolveArrayConnection({ args }, [1, 2, 3, 4]),
      );
    },
  }),
}));
```

---

**Previous**: [Context Management](./02-context-management.md)

**Next**: [Integration with Errors Plugin](./04-integration-with-errors-plugin.md)
