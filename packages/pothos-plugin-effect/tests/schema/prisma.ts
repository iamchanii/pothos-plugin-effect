import { resolveArrayConnection } from '@pothos/plugin-relay';
import { Effect } from 'effect';
import { UserService } from '../setupTest.js';
import { builder } from './builder.js';

const UserSchema = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    email: t.exposeString('email'),
    name: t.exposeString('name', { nullable: true }),
  }),
});

const UserConnectionSchema = builder.connectionObject({
  name: 'UserConnection',
  type: UserSchema,
});

builder.queryFields((t) => ({
  user: t.effect({
    type: UserSchema,
    resolve: () =>
      Effect.gen(function* () {
        const userService = yield* UserService;
        return userService.getUser();
      }),
  }),
  users: t.effect({
    type: UserConnectionSchema,
    args: {
      ...t.arg.connectionArgs(),
    },
    resolve: (_root, args) =>
      Effect.gen(function* () {
        const userService = yield* UserService;
        const users = yield* Effect.promise(() => userService.fetchUsers());

        return resolveArrayConnection({ args }, users);
      }),
  }),
}));
