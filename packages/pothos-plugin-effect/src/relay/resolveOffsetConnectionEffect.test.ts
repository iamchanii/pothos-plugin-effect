import { Effect, Option, pipe } from 'effect';
import { expect, test } from 'vitest';
import { resolveOffsetConnectionEffect } from './resolveOffsetConnectionEffect.js';

test('should resolve effect which return connection', async () => {
  const program = pipe(
    Effect.succeed([{ id: 1 }, { id: 2 }, { id: 3 }, null]),
    resolveOffsetConnectionEffect({ args: {} }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
          "node": {
            "id": 1,
          },
        },
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
          "node": {
            "id": 2,
          },
        },
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
          "node": {
            "id": 3,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": "T2Zmc2V0Q29ubmVjdGlvbjoz",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
      },
    }
  `);
});

test('should resolve effect which return connection with Option items', async () => {
  const program = pipe(
    Effect.succeed([Option.some({ id: 1 }), Option.none()]),
    resolveOffsetConnectionEffect({ args: {} }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
          "node": {
            "id": 1,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
      },
    }
  `);
});

test('should resolve effect which return connection boxed with Option', async () => {
  const program = pipe(
    Effect.succeedSome([{ id: 1 }, { id: 2 }, { id: 3 }, null]),
    resolveOffsetConnectionEffect({ args: {} }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
          "node": {
            "id": 1,
          },
        },
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
          "node": {
            "id": 2,
          },
        },
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
          "node": {
            "id": 3,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": "T2Zmc2V0Q29ubmVjdGlvbjoz",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
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
    resolveOffsetConnectionEffect({ args: {} }),
  );

  const result = await Effect.runPromise(program);

  expect(result).toMatchInlineSnapshot(`
    {
      "edges": [
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
          "node": {
            "id": 1,
          },
        },
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjox",
          "node": {
            "id": 2,
          },
        },
        {
          "cursor": "T2Zmc2V0Q29ubmVjdGlvbjoy",
          "node": {
            "id": 3,
          },
        },
        null,
      ],
      "pageInfo": {
        "endCursor": "T2Zmc2V0Q29ubmVjdGlvbjoz",
        "hasNextPage": false,
        "hasPreviousPage": false,
        "startCursor": "T2Zmc2V0Q29ubmVjdGlvbjow",
      },
    }
  `);
});
