# pothos-plugin-effect

> Work in progress. Keep watching.

## Installation

```bash
# @effect/io and @effect/data is peer-dependencies.
pnpm add pothos-plugin-effect @effect/io @effect/data
```

## Setup

```ts
import EffectPlugin from 'pothos-plugin-effect';

new SchemaBuilder({
  plugins: [EffectPlugin],
});
```

## Usage

```typescript
t.effect({
  type: 'String',
  effect: {
    services: [
      // [Tag, Service]
      [Random, Random.of({ next: () => Effect.succeed(0.5) })],
      // or You can provide service using context.
      [
        Random,
        (context: SchemaTypes['Context']) =>
          Random.of({ next: () => Effect.succeed(context.randomValue) }),
      ],
    ],
  },
  resolve: () =>
    pipe(
      Random,
      Effect.flatMap(random => random.next()),
      Effect.map(value =>
        value > 0.5
          ? Effect.succeed('Lucky!')
          : Effect.succeed('Nah')
      ),
    ),
});
```

See an [example](./example) in action.

## Licenses

MIT
