// import SchemaBuilder from '@pothos/core';
// import RelayPlugin, { resolveArrayConnection } from '@pothos/plugin-relay';
// import { Effect } from 'effect';
// import { execute, parse } from 'graphql';
// import EffectPlugin from '../index.js';

// let builder: InstanceType<typeof SchemaBuilder<{}>>;

// beforeEach(() => {
//   builder = new SchemaBuilder<{}>({
//     plugins: [RelayPlugin, EffectPlugin],
//     relayOptions: {},
//     prisma: {} as never,
//   });

//   builder.queryType({});
// });

// it('t.effectConnection fields should allow querying for paginated effects', async () => {
//   builder.queryField('roll', (t) =>
//     t.effectConnection({
//       type: 'Int',
//       resolve(_root, args) {
//         return Effect.succeed(resolveArrayConnection({ args }, [1, 2, 3, 4]));
//       },
//     }),
//   );

//   const schema = builder.toSchema();
//   const document = parse(`{
//     roll {
//       edges {
//         node
//       }
//     }
//   }`);
//   const result = await execute({ document, schema });

//   expect(result.data).toEqual({
//     roll: {
//       edges: [{ node: 1 }, { node: 2 }, { node: 3 }, { node: 4 }],
//     },
//   });
// });
