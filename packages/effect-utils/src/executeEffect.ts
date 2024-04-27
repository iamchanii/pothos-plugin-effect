import { Effect, Runtime } from 'effect';
import { handleNullableValue } from './handleNullableValue.js';
import { handleExit } from './handleExit.js';

export async function executeEffect<A, E, R>(
  effect: Effect.Effect<A, E, R>,
  runtime: Runtime.Runtime<R>,
) {
  const result = await Runtime.runPromiseExit(runtime)(effect);
  const value = handleExit(result);

  return handleNullableValue(value);
}
