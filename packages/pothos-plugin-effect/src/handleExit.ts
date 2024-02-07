import { Cause, Exit } from 'effect';

export function handleExit<E, A>(exit: Exit.Exit<E, A>): A {
  if (Exit.isFailure(exit)) {
    const defect = Cause.squash(exit.cause);

    if (defect instanceof Error) {
      throw defect;
    }

    throw new Error(String(defect), { cause: defect });
  }

  return exit.value;
}
