import { execute, parse, printSchema } from 'graphql';

import { schema } from './fixtures/schema.ts';

it('genereates schema', () => {
  expect(printSchema(schema)).toMatchSnapshot();
});

it('should handle Effect resolver', async () => {
  const document = parse(`{ ping2 }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({ ping2: 'pong' });
});

it('should provide services', async () => {
  const document = parse(`{ ping3 }`);

  const result = await execute({
    contextValue: { randomValue: 0.777 },
    document,
    schema,
  });

  expect(result.data).toEqual({ 'ping3': 'lucky!' });
});

it('should provide services - 2', async () => {
  const document = parse(`{ ping3 }`);

  const result = await execute({
    contextValue: { randomValue: 0.1 },
    document,
    schema,
  });

  expect(result.data).toEqual({ 'ping3': 'not lucky...' });
});
