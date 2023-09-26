import type { Prisma } from '@prisma/client';

export class PrismaClientKnownRequestError {
  readonly _tag = 'PrismaClientKnownRequestError';

  constructor(
    readonly message: string,
    readonly cause: Prisma.PrismaClientKnownRequestError,
  ) {}
}

export class PrismaClientUnknownRequestError {
  readonly _tag = 'PrismaClientUnknownRequestError';

  constructor(
    readonly message: string,
    readonly cause: Prisma.PrismaClientUnknownRequestError,
  ) {}
}

export class PrismaClientRustPanicError {
  readonly _tag = 'PrismaClientRustPanicError';

  constructor(
    readonly message: string,
    readonly cause: Prisma.PrismaClientRustPanicError,
  ) {}
}

export class PrismaClientInitializationError {
  readonly _tag = 'PrismaClientInitializationError';

  constructor(
    readonly message: string,
    readonly cause: Prisma.PrismaClientInitializationError,
  ) {}
}

export class PrismaClientValidationError {
  readonly _tag = 'PrismaClientValidationError';

  constructor(
    readonly message: string,
    readonly cause: Prisma.PrismaClientValidationError,
  ) {}
}

export type PrismaError =
  | PrismaClientKnownRequestError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientInitializationError
  | PrismaClientValidationError;

export function handlePrismaError(error: unknown): PrismaError {
  if (error instanceof Error) {
    if (error.name === 'PrismaClientKnownRequestError' || error.name === 'NotFoundError') {
      return new PrismaClientKnownRequestError(error.message, error as never);
    }

    if (error.name === 'PrismaClientUnknownRequestError') {
      return new PrismaClientUnknownRequestError(error.message, error as never);
    }

    if (error.name === 'PrismaClientRustPanicError') {
      return new PrismaClientRustPanicError(error.message, error as never);
    }

    if (error.name === 'PrismaClientValidationError') {
      return new PrismaClientValidationError(error.message, error as never);
    }

    if (error.name === 'PrismaClientInitializationError') {
      return new PrismaClientInitializationError(error.message, error as never);
    }
  }

  throw new TypeError(`Unknown Prisma error`, { cause: error });
}
