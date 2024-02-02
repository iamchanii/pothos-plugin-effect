import { Effect, Runtime } from 'effect';
import { handleNullableValue } from '../libs/handleNullableValue.js';
import { handleExit } from '../libs/handleExit.js';

export async function runEffectFieldResult<R, E, A>(
  effectFieldResult: Effect.Effect<R, E, A>,
  runtime: Runtime.Runtime<R>,
) {
  const result = await Runtime.runPromiseExit(runtime)(effectFieldResult);
  const value = handleExit(result);

  return handleNullableValue(value);
}
