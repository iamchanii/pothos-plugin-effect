# Effect Integration Plugin

The Effect integration plugin adds the `t.effect()` field method to implement resolvers using [Effect](https://effect.website/).

## Usage

### Install

```bash
# @effect/io and @effect/data is peer-dependencies.
pnpm install pothos-plugin-effect @effect/io @effect/data
```

### Setup

```ts
import EffectPlugin from 'pothos-plugin-effect';

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});
```

### Options

The `effectOptions` object passed to builder can contain the following properties:

#### `effectOptions.globalContext`

This option configures the `Context` that is available to all Effects in `resolve()`.

```ts
import EffectPlugin from 'pothos-plugin-effect';
import * as Context from '@effect/data/context';
import { Dice } from '../contexts';

declare const DiceContext: Context.Context<Dice>;

const builder = new SchemaBuilder<{
  EffectGlobalContext: Context.Context<Dice>;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    globalContext: DiceContext,
  },
});
```

To provide `Context` based on a context value, write it as a function like this:

```ts
const builder = new SchemaBuilder<{
  EffectGlobalContext: Context.Context<Dice>;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    globalContext: (context) =>
      Context.make(
        Dice,
        Dice.of({ roll: () => Effect.succeed(context.tricked) }),
      ),
  },
});
```

#### `effectOptions.globalLayer`

This option configures the `Layer` that is available to all Effects in `resolve()`.

```ts
import EffectPlugin from 'pothos-plugin-effect';
import * as Layer from '@effect/io/Layer';
import { Dice } from '../contexts';

declare const DiceLayer: Layer.Layer<never, never, Dice>;

const builder = new SchemaBuilder<{
  EffectGlobalLayer: Layer.Layer<never, never, Dice>;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    globalLayer: DiceLayer,
  },
});
```

To provide `Layer` based on a context value, write it as a function like this:

```ts
const builder = new SchemaBuilder<{
  EffectGlobalLayer: Layer.Layer<never, never, Dice>;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    globalLayer: (context) =>
      Layer.succeed(
        Dice,
        Dice.of({ roll: () => Effect.succeed(context.tricked) }),
      ),
  },
});
```

### Implement Resolver Using Effect

To implement resolver using Effect, you can use the new `t.effect` field method. (WIP)

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      services: [
        Dice,
        Dice.of({ roll: () => Effect.succeed(5) }),
      ],
    },
    resolve: () =>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

## Acknowledges

- Pothos by [@hayes](https://github.com/hayes) ([GitHub](https://github.com/hayes/pothos)/[Docs](https://pothos-graphql.dev/)) - A nice GraphQL Schema builder. I heavily relied on the README for this project and The documentation of the plugin implementation is excellent.

## Licenses

MIT
