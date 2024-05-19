import {
  execute,
  lexicographicSortSchema,
  parse,
  printSchema,
  subscribe,
} from 'graphql';
import { expect, test } from 'vitest';
import { schema } from './schema/index.js';

test('print schema', () => {
  expect(printSchema(lexicographicSortSchema(schema))).toMatchInlineSnapshot(`
    "type BaseError implements Error {
      message: String!
    }

    interface Error {
      message: String!
    }

    type Mutation {
      addPost(title: String!): MutationAddPostResult!
    }

    union MutationAddPostResult = BaseError | MutationAddPostSuccess

    type MutationAddPostSuccess {
      data: Boolean!
    }

    type PageInfo {
      endCursor: String
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      startCursor: String
    }

    type Post {
      content: String
      id: ID!
      title: String!
    }

    type Query {
      boolean: Boolean!
      booleanList: [Boolean!]!
      float: Float!
      floatList: [Float!]!
      id: ID!
      idList: [ID!]!
      int: Int!
      intList: [Int!]!
      posts: Post
      string: String!
      stringList: [String!]!
      user: User!
      users(after: ID, before: ID, first: Int, last: Int): UserConnection!
    }

    type Subscription {
      newPosts: ID!
    }

    type User {
      email: String!
      id: ID!
      name: String
    }

    type UserConnection {
      edges: [UserEdge]!
      pageInfo: PageInfo!
    }

    type UserEdge {
      cursor: String!
      node: User!
    }"
  `);
});

test('query base fields', async () => {
  const document = parse(`{
    int
    intList
    string
    stringList
    float
    floatList
    boolean
    booleanList
    id
    idList
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "boolean": true,
        "booleanList": [
          true,
          false,
        ],
        "float": 1.5,
        "floatList": [
          1.5,
          2.5,
          3.5,
        ],
        "id": "1",
        "idList": [
          "1",
          "2",
          "3",
        ],
        "int": 1,
        "intList": [
          1,
          2,
          3,
        ],
        "string": "hello",
        "stringList": [
          "hello",
          "world",
        ],
      },
    }
  `);
});

test('query drizzle fields', async () => {
  const document = parse(`{
    posts {
      id
      title
      content
    }
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "posts": {
          "content": "Book Content",
          "id": "1",
          "title": "Book Title",
        },
      },
    }
  `);
});

test('query prisma fields', async () => {
  const document = parse(`{
    user {
      id
      name
      email
    }
    users {
      edges {
        node {
          id
          name
          email
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "user": {
          "email": "john@acme.com",
          "id": "1",
          "name": "John",
        },
        "users": {
          "edges": [
            {
              "node": {
                "email": "john@acme.com",
                "id": "1",
                "name": "John",
              },
            },
          ],
          "pageInfo": {
            "hasNextPage": false,
            "hasPreviousPage": false,
          },
        },
      },
    }
  `);
});

test('mutation addPost field', async () => {
  const document = parse(`mutation {
    expectedAsBaseError: addPost(title: "Spam") {
      __typename
      ... on BaseError {
        message
      }
    }
    expectedAsSuccess: addPost(title: "Hello") {
      __typename
      ... on MutationAddPostSuccess {
        data
      }
    }
  }`);

  const result = await execute({ document, schema });

  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "expectedAsBaseError": {
          "__typename": "BaseError",
          "message": "Spam is not allowed",
        },
        "expectedAsSuccess": {
          "__typename": "MutationAddPostSuccess",
          "data": true,
        },
      },
    }
  `);
});

test('subscription newPosts field', async () => {
  const document = parse(`subscription {
    newPosts
  }`);

  const iterable = await subscribe({ document, schema });
  const result = [];

  // @ts-ignore
  for await (const value of iterable) {
    result.push(value.data);
  }

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "newPosts": "1",
      },
      {
        "newPosts": "2",
      },
      {
        "newPosts": "3",
      },
      {
        "newPosts": "4",
      },
      {
        "newPosts": "5",
      },
      {
        "newPosts": "6",
      },
      {
        "newPosts": "7",
      },
      {
        "newPosts": "8",
      },
      {
        "newPosts": "9",
      },
      {
        "newPosts": "10",
      },
    ]
  `);
});
