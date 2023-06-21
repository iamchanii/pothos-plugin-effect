# pothos-plugin-effect

Status: WIP

## Installation

```bash
# @effect/io and @effect/data is peer-dependencies.
pnpm add pothos-plugin-effect @effect/io @effect/data
```

## Setup

```ts
import EffectPlugin from 'pothos-plugin-effect';

new SchemaBuilder<{
  EffectDefaultLayer: Layer.Layer<never, never, Random>;
  EffectDefaultContext: Context.Context<Random>;
  EffectDefaultServices: Random;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    defaultLayer: (context) => Layer.succeed(Random, {}),
    defaultContext: (context) => Context.empty(),
    defaultServices: (context) => [
      [Random, (_context) => Random.of({ next: () => Effect.succeed(0.5) })],
    ],
  },
});
```

## Usage

```typescript
t.effect({
  type: 'String',
  effect: {
    services: (_context) => [
      [Random, (_context) => Random.of({ next: () => Effect.succeed(0.5) })],
    ],
    context: (_context) => Context.empty({}),
    layer: (_context) => Layer.succeed({}),
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

## Licenses

MIT
