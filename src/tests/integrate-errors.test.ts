import SchemaBuilder from '@pothos/core';
import ErrorsPlugin from '@pothos/plugin-errors';
import EffectPlugin from '../index';
import { Cause, Effect } from 'effect/index';
import { execute, parse } from 'graphql';

class ForbiddenError extends Error {
  readonly _tag = 'ForbiddenError';

  constructor(role: string, options?: ErrorOptions) {
    super(`You are not allowed to do this as a ${role}`, options);
  }
}

class UnexpectedError extends Error {
  readonly _tag = 'UnexpectedError';

  constructor(options?: ErrorOptions) {
    super('An unexpected error occurred', options);
  }
}

let builder: InstanceType<typeof SchemaBuilder<{}>>;

beforeEach(() => {
  builder = new SchemaBuilder<{}>({
    plugins: [ErrorsPlugin, EffectPlugin],
    relayOptions: {},
    effectOptions: {},
    errorOptions: {},
    prisma: {} as never,
  });

  builder.queryType({});

  // referenced from https://pothos-graphql.dev/docs/plugins/errors#recommended-usage
  const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
    fields: (t) => ({
      message: t.exposeString('message'),
    }),
  });

  builder.objectType(Error, {
    name: 'BaseError',
    interfaces: [ErrorInterface],
  });

  builder.objectType(ForbiddenError, {
    name: 'ForbiddenError',
    interfaces: [ErrorInterface],
  });

  builder.objectType(UnexpectedError, {
    name: 'UnexpectedError',
    interfaces: [ErrorInterface],
  });
});

it('should return data as base error type when field effect failured with default error', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      errors: {
        types: [Error],
      },
      resolve() {
        return Effect.fail(new Error('503 Service Unavailable'));
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount {
      __typename
      ... on BaseError {
        message
      }
    }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({
    totalUserCount: {
      __typename: 'BaseError',
      message: '503 Service Unavailable',
    },
  });
});

it('should return data as error type when field effect return fail', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      errors: {
        types: [ForbiddenError],
      },
      resolve() {
        return Effect.fail(new ForbiddenError('user'));
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount {
      __typename
      ... on ForbiddenError {
        message
      }
    }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({
    totalUserCount: {
      __typename: 'ForbiddenError',
      message: 'You are not allowed to do this as a user',
    },
  });
});

it('should return data as error type when field effect return caused fail', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      errors: {
        types: [ForbiddenError],
      },
      resolve() {
        return Effect.failCause(Cause.fail(new ForbiddenError('user')));
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount {
      __typename
      ... on ForbiddenError {
        message
      }
    }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({
    totalUserCount: {
      __typename: 'ForbiddenError',
      message: 'You are not allowed to do this as a user',
    },
  });
});

it('should return errors when field effect die', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      errors: {
        types: [ForbiddenError],
      },
      resolve() {
        return Effect.die(new UnexpectedError());
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount {
      __typename
      ... on ForbiddenError {
        message
      }
    }
  }`);
  const result = await execute({ document, schema });

  expect(result.errors).not.toBeNull();
});

it('should return errors when field effect throw error', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      resolve() {
        throw 'Not Implemented';
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount { __typename }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toBeNull();
  expect(result.errors?.[0].originalError).toBeInstanceOf(Error);
});

it('should return custom errors when field effect throw error and failErrorConstructor provided', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      effect: {
        failErrorConstructor: UnexpectedError,
      },
      // @ts-expect-error
      resolve() {
        return Effect.fail('Not Implemented');
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount { __typename }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toBeNull();
  expect(result.errors?.[0].originalError).toBeInstanceOf(UnexpectedError);
});

it('should return data as error type when field effect throw error, failErrorConstructor provided and errors.types set', async () => {
  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      effect: {
        failErrorConstructor: UnexpectedError,
      },
      errors: {
        types: [UnexpectedError],
      },
      // @ts-expect-error
      resolve() {
        return Effect.fail('Not Implemented');
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount { __typename }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({
    totalUserCount: {
      __typename: 'UnexpectedError',
    },
  });
});

it('should return data as error type when field effect throw error, failErrorConstructor provided and errors.types set with builder options', async () => {
  builder = new SchemaBuilder<{}>({
    plugins: [ErrorsPlugin, EffectPlugin],
    relayOptions: {},
    effectOptions: {
      defaultFailErrorConstructor: UnexpectedError,
    },
    errorOptions: {
      defaultTypes: [UnexpectedError],
    },
    prisma: {} as never,
  });

  builder.queryType({});

  // referenced from https://pothos-graphql.dev/docs/plugins/errors#recommended-usage
  const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
    fields: (t) => ({
      message: t.exposeString('message'),
    }),
  });

  builder.objectType(Error, {
    name: 'BaseError',
    interfaces: [ErrorInterface],
  });

  builder.objectType(UnexpectedError, {
    name: 'UnexpectedError',
    interfaces: [ErrorInterface],
  });

  builder.queryField('totalUserCount', t =>
    t.effect({
      type: 'String',
      errors: {},
      // @ts-expect-error
      resolve() {
        return Effect.fail('Not Implemented');
      },
    }));

  const schema = builder.toSchema();
  const document = parse(`{
    totalUserCount { __typename }
  }`);
  const result = await execute({ document, schema });

  expect(result.data).toEqual({
    totalUserCount: {
      __typename: 'UnexpectedError',
    },
  });
});
