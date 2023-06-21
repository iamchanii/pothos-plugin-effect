import { execute, parse, printSchema } from 'graphql';

import { schema } from './fixtures/schema.ts';

it('genereates schema', () => {
  expect(printSchema(schema)).toMatchSnapshot();
});

it('Effect.succeed', async () => {
  const document = parse(`{ pingEffect }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({ pingEffect: 'pong' });
});

describe('provideServices', () => {
  const document = parse(`{ pingService }`);

  it('case 1', async () => {
    const result = await execute({
      contextValue: {},
      document,
      schema,
    });

    expect(result).toMatchInlineSnapshot(`
{
  "data": {
    "pingService": "not lucky...",
  },
}
`);
  });
});
