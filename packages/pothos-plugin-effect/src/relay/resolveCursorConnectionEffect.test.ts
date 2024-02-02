import { Effect, Option, pipe } from 'effect';
import { expect, test } from 'vitest';
import { resolveCursorConnectionEffect } from './resolveCursorConnectionEffect.js';

test('should resolve effect which return connection', async () => {
  const program = pipe(
    Effect.succeed([{ id: 1 }, { id: 2 }, { id: 3 }, null]),
    resolveCursorConnectionEffect({
      args: {},
      toCursor: (node) => `Cursor:${node.id}`,
    }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "Cursor:1",
          "node": {
            "id": 1,
          },
        },
        {
          "cursor": "Cursor:2",
          "node": {
            "id": 2,
          },
        },
        {
          "cursor": "Cursor:3",
          "node": {
            "id": 3,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": undefined,
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "Cursor:1",
      },
    }
  `);
});

test('should resolve effect which return connection with Option items', async () => {
  const program = pipe(
    Effect.succeed([Option.some({ id: 1 }), Option.none()]),
    resolveCursorConnectionEffect({
      args: {},
      toCursor: (node) => `Cursor:${node.id}`,
    }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "Cursor:1",
          "node": {
            "id": 1,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": undefined,
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "Cursor:1",
      },
    }
  `);
});

test('should resolve effect which return connection boxed with Option', async () => {
  const program = pipe(
    Effect.succeedSome([{ id: 1 }, { id: 2 }, { id: 3 }, null]),
    resolveCursorConnectionEffect({
      args: {},
      toCursor: (node) => `Cursor:${node.id}`,
    }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "Cursor:1",
          "node": {
            "id": 1,
          },
        },
        {
          "cursor": "Cursor:2",
          "node": {
            "id": 2,
          },
        },
        {
          "cursor": "Cursor:3",
          "node": {
            "id": 3,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": undefined,
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "Cursor:1",
      },
    }
  `);
});

test('should resolve effect which return connection boxed with Option and items are boxed', async () => {
  const program = pipe(
    Effect.succeedSome([
      Option.some({ id: 1 }),
      Option.some({ id: 2 }),
      Option.some({ id: 3 }),
      Option.none(),
    ]),
    resolveCursorConnectionEffect({
      args: {},
      toCursor: (node) => `Cursor:${node.id}`,
    }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "Cursor:1",
          "node": {
            "id": 1,
          },
        },
        {
          "cursor": "Cursor:2",
          "node": {
            "id": 2,
          },
        },
        {
          "cursor": "Cursor:3",
          "node": {
            "id": 3,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": undefined,
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "Cursor:1",
      },
    }
  `);
});
