import { Effect } from 'effect';
import { builder } from './builder.js';

const ErrorInterface = builder.interfaceRef<Error>('Error').implement({
  fields: (t) => ({
    message: t.exposeString('message'),
  }),
});

builder.objectType(Error, {
  name: 'BaseError',
  interfaces: [ErrorInterface],
});

builder.mutationFields((t) => ({
  addPost: t.effect({
    args: {
      title: t.arg.string({ required: true }),
    },
    type: 'Boolean',
    errors: {
      types: [Error],
    },
    resolve: (_root, args) =>
      Effect.gen(function* () {
        if (args.title === 'Spam') {
          yield* Effect.fail(new Error('Spam is not allowed'));
        }

        return true;
      }),
  }),
}));
