# pothos-plugin-effect

[![Version on NPM](https://img.shields.io/npm/v/pothos-plugin-effect)](https://www.npmjs.com/package/pothos-plugin-effect)

The Effect integration plugin adds the `t.effect()` field method to implement resolvers using [Effect](https://effect.website/).

## Features

- Write resolver functions using Effect Ecosystems.
- Support providing local layers, contexts and services.
- Support providing global layer and context.
- Automatic handle uncaught errors with Errors plugin.
- Support `Option<T>` for nullable field.

## Examples

- [01-basic](/examples/01-basic/)
- [02-with-errors-plugin](/examples/02-with-errors-plugin/)

## Usage

### Install

```bash
# effect is a peer-dependency
pnpm install pothos-plugin-effect effect
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

#### globalContext

This option provides the global `Context` that is available to all `t.effect()` functions.

```ts
import EffectPlugin from 'pothos-plugin-effect';
import { Context } from 'effect';
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

#### globalLayer

This option provides the global `Layer` that is available to all `t.effect()` functions.

```ts
import EffectPlugin from 'pothos-plugin-effect';
import { Layer } from 'effect';
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

To implement resolver using Effect, you can use the new `t.effect` field method.

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    resolve: () => Effect.succeed(1),
  }),
}));
```

The returned `Effect.Effect` will be typed based on field configurations. In the example above, it is `Effect.Effect<never, never, number>`.

#### Provide Services

To provide services in your resolver function, you can set `effect.services`.

```ts
declare const Dice: Context.Tag<Dice, Dice>;
declare const DiceLive: Dice;

builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      services: [
        [Dice, DiceLive],
      ],
    },
    resolve: () =>
      // Effect.Effect<Dice, never, number>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

To provide service based on a context value, write it as a function like this:

```ts
declare const Dice: Context.Tag<Dice, Dice>;

builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      services: [
        [Dice, (context) => Dice.of({ roll: Effect.succeed(context.tricked) })],
      ],
    },
    resolve: () =>
      // Effect.Effect<Dice, never, number>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

#### Provide Contexts

To provide contexts in your resolver function, you can set `effect.contexts`.

```ts
declare const DiceContext: Context.Context<Dice>;

builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      contexts: [DiceContext],
    },
    resolve: () =>
      // Effect.Effect<Dice, never, number>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

To provide contexts based on a context value, write it as a function like this:

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      contexts: [
        (context) => Dice.of({ roll: Effect.succeed(context.tricked) }),
      ],
    },
    resolve: () =>
      // Effect.Effect<Dice, never, number>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

#### Provide Layers

To provide layers in your resolver function, you can set `effect.layers`.

```ts
declare const DiceLayer: Layer.Layer<never, never, Dice>;

builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      layers: [DiceLayer],
    },
    resolve: () =>
      // Effect.Effect<Dice, never, number>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

To provide layers based on a context value, write it as a function like this:

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    effect: {
      layers: [
        (context) =>
          Layer.succeed(
            Dice,
            Dice.of({ roll: Effect.succeed(context.tricked) }),
          ),
      ],
    },
    resolve: () =>
      // Effect.Effect<Dice, never, number>
      pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      ),
  }),
}));
```

## Acknowledges

- Pothos by [@hayes](https://github.com/hayes) ([GitHub](https://github.com/hayes/pothos)/[Docs](https://pothos-graphql.dev/)) - A nice GraphQL Schema builder. I heavily relied on the README for this project and The documentation of the plugin implementation is excellent.
- Effect ([GitHub](https://github.com/effect-TS/)/[Docs](https://effect.website/))

## Licenses

MIT
