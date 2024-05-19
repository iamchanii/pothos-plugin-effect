import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { Context, Effect, Layer, Scope } from 'effect';
import * as drizzleSchema from '../drizzle/schema.js';

export class Drizzle extends Context.Tag('Drizzle')<
  Drizzle,
  ReturnType<typeof makeDrizzle>
>() {}

const makeDrizzle = () => {
  const sqlite = new Database('./prisma/dev.db');
  return drizzle(sqlite, { schema: drizzleSchema });
};

export class Prisma extends Context.Tag('Prisma')<
  Prisma,
  ReturnType<typeof makePrisma>
>() {}

const makePrisma = () => {
  return new PrismaClient();
};

export class UserService extends Context.Tag('UserService')<
  UserService,
  Effect.Effect.Success<typeof makeUserService>
>() {}

const makeUserService = Effect.gen(function* () {
  const prisma = yield* Prisma;

  return {
    getUser: (query?: any) => prisma.user.findFirstOrThrow({ ...query }),
    fetchUsers: (query?: any) => prisma.user.findMany({ ...query }),
  };
});

export class PostService extends Context.Tag('PostService')<
  PostService,
  Effect.Effect.Success<typeof makePostService>
>() {}

const makePostService = Effect.gen(function* () {
  const drizzle = yield* Drizzle;

  return {
    getPost: () => drizzle.query.posts.findFirst(),
  };
});

export async function setupTest() {
  const drizzle = makeDrizzle();
  const prisma = makePrisma();

  const drizzleLive = Layer.succeed(Drizzle, drizzle);
  const prismaLive = Layer.succeed(Prisma, prisma);
  const userServiceLive = Layer.effect(UserService, makeUserService);
  const postServiceLive = Layer.effect(PostService, makePostService);
  const mainLive = Layer.mergeAll(userServiceLive, postServiceLive).pipe(
    Layer.provideMerge(drizzleLive),
    Layer.provideMerge(prismaLive),
  );

  const scope = Effect.runSync(Scope.make());
  const runtime = await Effect.runPromise(
    Layer.toRuntime(mainLive).pipe(Scope.extend(scope)),
  );

  return { runtime, prisma };
}
