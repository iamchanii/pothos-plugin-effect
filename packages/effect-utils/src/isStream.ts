import { Effect, Stream } from 'effect';

// This is a unsafe way to check if a value is a Stream.
// I hope that the Effect will expose the `Stream.isStream` function.
export const isStream = <A, E, R>(
  value: unknown,
): value is Stream.Stream<A, E, R> => {
  return (
    Effect.isEffect(value) === false &&
    Object.getPrototypeOf(value).constructor.name.startsWith('Stream')
  );
};
