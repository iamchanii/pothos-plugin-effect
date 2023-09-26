import { Effect, Option, pipe } from 'effect';
import { PothosEffectPrismaClient } from './PothosEffectPrismaClient';
import { handlePrismaError } from './errors';

export function effectify(modelName: string, operation: string, nullable: boolean) {
  return (...args: any[]) =>
    pipe(
      Effect.serviceOption(PothosEffectPrismaClient),
      Effect.flatMap((maybePrisma) =>
        Option.match(maybePrisma, {
          onNone: () => Effect.die('PothosEffectPrismaClient is not provided.'),
          onSome: (prisma: any) =>
            pipe(
              Effect.tryPromise({
                try: () => prisma[modelName][operation](...args),
                catch: error => handlePrismaError(error),
              }),
              Effect.catchAll(e => e._tag === 'PrismaClientKnownRequestError' ? Effect.fail(e) : Effect.die(e)),
              Effect.map(x => nullable ? Option.fromNullable(x) : x),
            ),
        })
      ),
    );
}
