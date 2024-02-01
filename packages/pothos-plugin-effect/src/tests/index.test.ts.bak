// import SchemaBuilder from '@pothos/core';
// import { Context, Effect, Layer, Option, Runtime, pipe } from 'effect';
// import { describe, beforeEach, it } from 'vitest';
// import { execute, parse } from 'graphql';
// import EffectPlugin from '../index.js';
// import { Dice } from './fixtures/services.js';

// describe('essential', () => {
//   let builder: InstanceType<
//     typeof SchemaBuilder<{
//       EffectRuntime: Runtime.Runtime<Dice>;
//     }>
//   >;

//   beforeEach(() => {
//     builder = new SchemaBuilder({
//       plugins: [EffectPlugin],
//       relayOptions: {},
//       prisma: {} as never,
//     });

//     builder.queryField('aaaa', (t) =>
//       t.effect({
//         type: 'Int',
//         errors: {
//           types: [Error],
//         },
//         resolve: () => Effect.succeed(1),
//       }),
//     );

//     builder.queryType({});
//   });

//   it('should return errors if requirements are not met', async () => {
//     builder.queryField('error', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {},
//         // @ts-expect-error
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ error }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toBeNull();
//     expect(result.errors).not.toBeNull();
//   });

//   it('should return data if reqruirment provided via context', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {
//           contexts: [
//             Context.make(Dice, Dice.of({ roll: () => Effect.succeed(6) })),
//           ],
//         },
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: 6 });
//   });

//   it('should return data if reqruirment provided via service', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {
//           services: [[Dice, Dice.of({ roll: () => Effect.succeed(6) })]],
//         },
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: 6 });
//   });

//   it('should return data if reqruirment provided via layer', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {
//           layers: [
//             Layer.succeed(Dice, Dice.of({ roll: () => Effect.succeed(6) })),
//           ],
//         },
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: 6 });
//   });

//   it('should return data if reqruirment provided via context with execution context', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {
//           contexts: [
//             (context: any) =>
//               Context.make(
//                 Dice,
//                 Dice.of({ roll: () => Effect.succeed(context.diceResult) }),
//               ),
//           ],
//         },
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({
//       document,
//       schema,
//       contextValue: { diceResult: 42 },
//     });

//     expect(result.data).toEqual({ roll: 42 });
//   });

//   it('should return data if reqruirment provided via service with execution context', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {
//           services: [
//             [
//               Dice,
//               (context: any) =>
//                 Dice.of({ roll: () => Effect.succeed(context.diceResult) }),
//             ],
//           ],
//         },
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({
//       document,
//       schema,
//       contextValue: { diceResult: 42 },
//     });

//     expect(result.data).toEqual({ roll: 42 });
//   });

//   it('should return data if reqruirment provided via layer with execution context', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         effect: {
//           layers: [
//             (context: any) =>
//               Layer.succeed(
//                 Dice,
//                 Dice.of({ roll: () => Effect.succeed(context.diceResult) }),
//               ),
//           ],
//         },
//         resolve() {
//           return pipe(
//             Dice,
//             Effect.flatMap((dice) => dice.roll()),
//           );
//         },
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({
//       document,
//       schema,
//       contextValue: {
//         diceResult: 42,
//       },
//     });

//     expect(result.data).toEqual({ roll: 42 });
//   });

//   it('should return errors when effect return Option<T> and nullable is not truthy', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         // @ts-expect-error
//         resolve: () => Effect.succeed(Option.some(6)),
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toBeNull();
//     expect(result.errors).not.toBeNull();
//   });

//   it('should resolve Option.some<T> as result data from result which effect returned', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         nullable: true,
//         resolve: () => Effect.succeed(Option.some(6)),
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: 6 });
//   });

//   it('should resolve Option.none<T> as return data from result which effect returned', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: 'Int',
//         nullable: true,
//         resolve: () => Effect.succeed(Option.none()),
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: null });
//   });

//   it('should resolve Option.some<T>[] as return data from result which effect returned', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: ['Int'],
//         nullable: { items: true, list: false },
//         resolve: () =>
//           Effect.succeed([
//             Option.some(1),
//             Option.some(2),
//             Option.none(),
//             Option.some(4),
//           ]),
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: [1, 2, null, 4] });
//   });

//   it('should resolve Option.some<T[]> as return data from result which effect returned', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: ['Int'],
//         nullable: { items: false, list: true },
//         resolve: () => Effect.succeed(Option.some([1, 2, 3, 4])),
//       }),
//     );

//     builder.queryField('roll2', (t) =>
//       t.effect({
//         type: ['Int'],
//         nullable: { items: false, list: true },
//         resolve: () => Effect.succeed(Option.none()),
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll roll2 }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: [1, 2, 3, 4], roll2: null });
//   });

//   it('should resolve Option<Option<T>[]> as return data', async () => {
//     builder.queryField('roll', (t) =>
//       t.effect({
//         type: ['Int'],
//         nullable: { items: true, list: true },
//         resolve: () =>
//           Effect.succeed(
//             Option.some([
//               Option.some(1),
//               Option.some(2),
//               Option.none(),
//               Option.some(4),
//             ]),
//           ),
//       }),
//     );

//     builder.queryField('roll2', (t) =>
//       t.effect({
//         type: ['Int'],
//         nullable: { items: true, list: true },
//         resolve: () => Effect.succeed(Option.none()),
//       }),
//     );

//     const schema = builder.toSchema();
//     const document = parse(`{ roll roll2 }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: [1, 2, null, 4], roll2: null });
//   });
// });

// describe('global', () => {
//   it('should return errors if global context is not provided', async () => {
//     const builder = new SchemaBuilder<{
//       EffectGlobalContext: Context.Context<Dice>;
//     }>({
//       plugins: [EffectPlugin],
//       relayOptions: {},
//       // @ts-expect-error
//       effectOptions: {},
//     });

//     builder.queryType({
//       fields: (t) => ({
//         roll: t.effect({
//           type: 'Int',
//           resolve() {
//             return pipe(
//               Dice,
//               Effect.flatMap((dice) => dice.roll()),
//             );
//           },
//         }),
//       }),
//     });

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toBeNull();
//     expect(result.errors).not.toBeNull();
//   });

//   it('should return data if reqruirment provided via global context', async () => {
//     const builder = new SchemaBuilder<{
//       EffectGlobalContext: Context.Context<Dice>;
//     }>({
//       plugins: [EffectPlugin],
//       relayOptions: {},
//       effectOptions: {
//         globalContext: Context.make(
//           Dice,
//           Dice.of({ roll: () => Effect.succeed(42) }),
//         ),
//       },
//       prisma: {} as never,
//     });

//     builder.queryType({
//       fields: (t) => ({
//         roll: t.effect({
//           type: 'Int',
//           resolve() {
//             return pipe(
//               Dice,
//               Effect.flatMap((dice) => dice.roll()),
//             );
//           },
//         }),
//       }),
//     });

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: 42 });
//   });

//   it('should return errors if global layer is not provided', async () => {
//     const builder = new SchemaBuilder<{
//       EffectGlobalLayer: Layer.Layer<never, never, Dice>;
//     }>({
//       plugins: [EffectPlugin],
//       relayOptions: {},
//       // @ts-expect-error
//       effectOptions: {},
//     });

//     builder.queryType({
//       fields: (t) => ({
//         roll: t.effect({
//           type: 'Int',
//           resolve() {
//             return pipe(
//               Dice,
//               Effect.flatMap((dice) => dice.roll()),
//             );
//           },
//         }),
//       }),
//     });

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toBeNull();
//     expect(result.errors).not.toBeNull();
//   });

//   it('should return data if reqruirment provided via global layer', async () => {
//     const builder = new SchemaBuilder<{
//       EffectGlobalLayer: Layer.Layer<never, never, Dice>;
//     }>({
//       plugins: [EffectPlugin],
//       relayOptions: {},
//       effectOptions: {
//         globalLayer: Layer.succeed(
//           Dice,
//           Dice.of({ roll: () => Effect.succeed(42) }),
//         ),
//       },
//       prisma: {} as never,
//     });

//     builder.queryType({
//       fields: (t) => ({
//         roll: t.effect({
//           type: 'Int',
//           resolve() {
//             return pipe(
//               Dice,
//               Effect.flatMap((dice) => dice.roll()),
//             );
//           },
//         }),
//       }),
//     });

//     const schema = builder.toSchema();
//     const document = parse(`{ roll }`);
//     const result = await execute({ document, schema });

//     expect(result.data).toEqual({ roll: 42 });
//   });
// });
