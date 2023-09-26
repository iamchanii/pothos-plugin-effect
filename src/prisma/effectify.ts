import { Effect, Option, pipe } from 'effect';
import { PothosEffectPrismaClient } from './PothosEffectPrismaClient';

export function effectify(modelName: string, operation: string, nullable: boolean) {
  return (...args: any[]) =>
    pipe(
      Effect.serviceOption(PothosEffectPrismaClient),
      Effect.flatMap((maybePrisma) =>
        Option.match(maybePrisma, {
          onNone: () => Effect.die('PothosEffectPrismaClient is not provided.'),
          onSome: (prisma: any) =>
            pipe(
              Effect.promise(() => prisma[modelName][operation](...args)),
              Effect.map(x => nullable ? Option.fromNullable(x) : x),
            ),
        })
      ),
    );
}
