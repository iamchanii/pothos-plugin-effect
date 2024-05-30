import { Effect } from 'effect';
import { builder } from './builder.js';

builder.mutationFields((t) => ({
  sendMessages: t.effectWithInput({
    type: 'String',
    input: {
      target: t.input.string({
        required: true,
        description: 'The target of the message',
      }),
      message: t.input.string({
        required: true,
        description: 'The message to send',
      }),
    },
    resolve: (_root, { input }) =>
      Effect.succeed(
        `Sent message "${input.message}" to ${input.target} successfully!`,
      ),
  }),
}));
