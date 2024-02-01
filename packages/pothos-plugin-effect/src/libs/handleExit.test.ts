import { Exit } from 'effect';
import { expect, test } from 'vitest';
import { handleExit } from './handleExit.js';

test('if exit is failure, throw error', () => {
  const exit = Exit.fail(new Error('Failed to load'));

  expect(() => handleExit(exit)).toThrowError('Failed to load');
  expect(() => handleExit(exit)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Failed to load]`,
  );
});

test('if exit is failure, throw error and wrap cause.error with Error if string', () => {
  const exit = Exit.fail('Failed to load');

  expect(() => handleExit(exit)).toThrowError('Failed to load');
  expect(() => handleExit(exit)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Error: Failed to load]`,
  );
});

test('if exit is success, return value', () => {
  const exit = Exit.succeed({ id: 1 });

  expect(handleExit(exit)).toEqual({ id: 1 });
});

test('if cause is die type should be handled', () => {
  const exit = Exit.die('I/O error');

  expect(() => handleExit(exit)).toThrowError('I/O error');
  expect(() => handleExit(exit)).toThrowErrorMatchingInlineSnapshot(
    `[Error: Error: I/O error]`,
  );
});

test('if cause is die type should be handled - 2', () => {
  const exit = Exit.die(new Error('I/O error'));

  expect(() => handleExit(exit)).toThrowError('I/O error');
  expect(() => handleExit(exit)).toThrowErrorMatchingInlineSnapshot(
    `[Error: I/O error]`,
  );
});
