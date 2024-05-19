import { expect, test } from 'vitest';
import { isStream } from './isStream.js';
import { Effect, pipe, Stream } from 'effect';

test('should returns false if value is Effect', () => {
  const result = isStream(Effect.succeed(1));
  expect(result).toBe(false);
});

test('should returns true if value is Stream', () => {
  const result = isStream(Stream.make(1));
  expect(result).toBe(true);
});

test('should returns false if value is not Effect or Stream ', () => {
  const result = isStream({ pipe: () => void 0 });
  expect(result).toBe(false);
});
