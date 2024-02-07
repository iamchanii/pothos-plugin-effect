import { Cause, Exit } from 'effect';

export function handleExit<E, A>(exit: Exit.Exit<E, A>): A {
  if (Exit.isFailure(exit)) {
    const cause = exit.cause;

    if (Cause.isDieType(cause) && cause.defect instanceof Error) {
      throw cause.defect;
    }

    if (Cause.isFailType(cause) && cause.error instanceof Error) {
      throw cause.error;
    }

    throw new Error(Cause.pretty(cause), {
      cause:
        'error' in cause
          ? cause.error
          : 'defect' in cause
            ? cause.defect
            : cause,
    });
  }

  return exit.value;
}
