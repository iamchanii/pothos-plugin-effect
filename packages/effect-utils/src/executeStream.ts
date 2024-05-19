import { Effect, Runtime, Stream } from 'effect';
import { handleNullableValue } from './handleNullableValue.js';
import { handleExit } from './handleExit.js';
import { Repeater } from '@repeaterjs/repeater';

export function executeStream<A, E, R>(
  stream: Stream.Stream<A, E, R>,
  runtime: Runtime.Runtime<R>,
) {
  return new Repeater<A>(async (push, stop) => {
    const effect = stream.pipe(
      Stream.runForEach((value) => {
        push(handleNullableValue(value) as never);
        return Effect.void;
      }),
    );

    const result = await Runtime.runPromiseExit(runtime)(effect);

    try {
      handleExit(result);
      stop();
    } catch (error) {
      stop(error);
    }
  });
}
