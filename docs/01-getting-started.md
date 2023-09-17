# Getting Started

## Install

Install pothos-effect-plugin and effect. effect is a peer-dependency.

```
pnpm install pothos-plugin-effect effect
```

## Setup

Import `EffectPlugin` from pothos-effect-plugin and append into plugins on your SchemaBuilder.

```ts
import EffectPlugin from 'pothos-plugin-effect';

const builder = new SchemaBuilder({
  plugins: [EffectPlugin],
});
```

## Creating field with `t.effect`

You can use `t.effect` to create a field which uses Effect in resolve function.

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    resolve() {
      // $ExpectType Effect.Effect<never, never, number>
      return Effect.succeed(6);
    },
  }),
}));
```

Your resolve function is fully-typed. if your function returns incorrect types with specified type, you will get type error.

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    // Error: Type 'string' is not assignable to type 'number'.
    resolve() {
      // $ExpectType Effect.Effect<never, never, string>
      return Effect.succeed('Six');
    },
  }),
}));
```

You can write your resolve function with pipeline style.

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    resolve() {
      // $ExpectType Effect.Effect<never, never, number>
      return pipe(
        Effect.succeed(3),
        Effect.map(x => x * 2),
        Effect.flatMap(() => Effect.succeed(42)),
      );
    },
  }),
}));
```

You can write your resolve function with pipeline style.

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    resolve() {
      // $ExpectType Effect.Effect<never, never, number>
      return pipe(
        Effect.succeed(3),
        Effect.map(x => x * 2),
        Effect.flatMap(() => Effect.succeed(42)),
      );
    },
  }),
}));
```

It can also be written in a generator function style.

```ts
builder.queryFields(t => ({
  roll: t.effect({
    type: 'Int',
    resolve() {
      // $ExpectType Effect.Effect<never, never, number>
      return Effect.gen(function*(_) {
        const solution = yield* _(Effect.succeed(42));

        return solution;
      });
    },
  }),
}));
```

## Return array in `t.effect`

You can return array from your effect.

```ts
builder.queryFields(t => ({
  fruits: t.effect({
    type: ['String'],
    resolve() {
      // $ExpectType Effect.Effect<never, never, string[]>
      return Effect.succeed([
        'Apple',
        'Banana',
        'Lemon',
      ]);
    },
  }),
}));
```

## Return `Option<T>` in `t.effect`

You can return `Option<T>` from your effect for present nullable field.

```ts
builder.queryFields(t => ({
  bannedCount: t.effect({
    type: 'Int',
    nullable: true,
    resolve() {
      // $ExpectType Effect.Effect<never, never, Option.Option<number>>
      return Effect.succeed(Option.none());
    },
  }),
}));
```

You can also represent more complex fields by using `Option<T>`.

```ts
builder.queryFields(t => ({
  queues: t.effect({
    type: ['String'],
    nullable: { list: false, items: true },
    resolve() {
      // $ExpectType Effect.Effect<never, never, Option.Option<string>[]>
      return Effect.succeed([
        Option.none(),
        Option.none(),
        Option.some('task 1'),
      ]);
    },
  }),
}));
```

---

**Next**: [Context Management](./02-context-management.md)
