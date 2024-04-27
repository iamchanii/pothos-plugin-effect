import { Cause, Exit } from 'effect';

export function handleExit<A, E>(exit: Exit.Exit<A, E>): A {
  if (Exit.isFailure(exit)) {
    const defect = Cause.squash(exit.cause);

    if (defect instanceof Error) {
      throw defect;
    }

    throw new Error(String(defect), { cause: defect });
  }

  return exit.value;
}
