# Context Management

Context management is essentials of Effect and also you can uses it from Pothos with `t.effect`!

## Provide field-level contexts

You can use a tag to access the service. Basically, you'll get a type error similar to this:

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    // Error: Type 'Dice' is not assignable to type 'never'
    resolve() {
      // $ExpectType Effect.Effect<Dice, never, number>
      return pipe(
        Dice,
        Effect.flatMap(dice => dice.roll()),
      );
    },
  }),
}));
```

Also, you'll get a runtime error trying to execute your `t.effect` field.

```
Error: Service not found: Dice (defined at Object.Tag (...))
```

Let's look at how to fix this and provide context.

### Services

To provide services in your resolve function, you can set `effect.services`. `effect.services` should be get a list of tuples that are `[tag, implementation]`.

```ts
t.effect({
  type: 'Int',
  effect: {
    services: [
      [Dice, Dice.of({ roll: () => Effect.succeed(6) })],
    ],
  },
  resolve() {
    // $ExpectType Effect.Effect<Dice, never, number>
    return pipe(
      Dice,
      Effect.flatMap(dice => dice.roll()),
    );
  },
});
```

If you need to provide implementation based on execution context, you can write a function.

```ts
t.effect({
  type: 'Int',
  effect: {
    services: [
      [
        Dice,
        (context: ContextType) =>
          Dice.of({ roll: () => Effect.succeed(context.rollResult) }),
      ],
    ],
  },
  resolve() {
    // $ExpectType Effect.Effect<Dice, never, number>
    return pipe(
      Dice,
      Effect.flatMap(dice => dice.roll()),
    );
  },
});
```

Internally, given list of tuples from `effect.services` is added by the [Context.add](https://effect-ts.github.io/data/modules/Context.ts.html#add) method.

### Context

To provide contexts in your resolve function, you can set `effect.contexts`.

```ts
t.effect({
  type: 'Int',
  effect: {
    contexts: [
      DiceContext,
    ],
  },
  resolve() {
    // $ExpectType Effect.Effect<Dice, never, number>
    return pipe(
      Dice,
      Effect.flatMap(dice => dice.roll()),
    );
  },
});
```

If you need to provide based on execution context, you can write a function.

```ts
t.effect({
  type: 'Int',
  effect: {
    contexts: [
      (context: any) =>
        Context.make(
          Dice,
          Dice.of({ roll: () => Effect.succeed(context.diceResult) }),
        ),
    ],
  },
  resolve() {
    // $ExpectType Effect.Effect<Dice, never, number>
    return pipe(
      Dice,
      Effect.flatMap(dice => dice.roll()),
    );
  },
});
```

Internally, given array from `effect.contexts` is merged by the [Context.merge](https://effect-ts.github.io/data/modules/Context.ts.html#merge) method.

### Layer

To provide layers in your resolve fucntion, you can set `effect.layers`.

```ts
t.effect({
  type: 'Int',
  effect: {
    layers: [DiceLive],
  },
  resolve() {
    // $ExpectType Effect.Effect<Dice, never, number>
    return pipe(
      Dice,
      Effect.flatMap(dice => dice.roll()),
    );
  },
});
```

If you need to provide based on execution context, you can write a function.

```ts
t.effect({
  type: 'Int',
  effect: {
    layers: [
      (context: any) => context.isAdmin ? AdminDiceLayer : UserDiceLayer,
    ],
  },
  resolve() {
    // $ExpectType Effect.Effect<Dice, never, number>
    return pipe(
      Dice,
      Effect.flatMap(dice => dice.roll()),
    );
  },
});
```

Internally, given array from `effect.layers` is provided by the [Layer.provide](https://effect-ts.github.io/io/modules/Layer.ts.html#provide) method.

## Global contexts

You can provide global context and layer by configuring `effectOptions` in SchemaBuilder options.

### Context

_T.B.D_

```ts
const builder = new SchemaBuilder<{
  EffectGlobalContext: Context.Context<Dice>;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    globalContext: DiceContext,
  },
});
```

### Layer

_T.B.D_

```ts
const builder = new SchemaBuilder<{
  EffectGlobalLayer: Layer.Layer<never, never, Dice>;
}>({
  plugins: [EffectPlugin],
  effectOptions: {
    globalLayer: DiceLayer,
  },
});
```

---

**Previous**: [Getting Started](./01-getting-started.md)

**Next**: [Integration with Relay Plugin](./03-integration-with-relay-plugin.md)
