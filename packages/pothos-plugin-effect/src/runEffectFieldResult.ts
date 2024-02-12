import { Effect, Runtime } from 'effect';
import { handleNullableValue } from './handleNullableValue.js';
import { handleExit } from './handleExit.js';

export async function runEffectFieldResult<A, E, R>(
  effectFieldResult: Effect.Effect<A, E, R>,
  runtime: Runtime.Runtime<R>,
) {
  const result = await Runtime.runPromiseExit(runtime)(effectFieldResult);
  const value = handleExit(result);

  return handleNullableValue(value);
}
