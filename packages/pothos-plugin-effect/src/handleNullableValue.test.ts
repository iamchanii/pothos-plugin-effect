import { expect, test } from 'vitest';
import { handleNullableValue } from './handleNullableValue.js';
import { Option } from 'effect';

test('if value is just value, return value', () => {
  const value = { id: 1 };
  const result = handleNullableValue(value);

  expect(result).toEqual({ id: 1 });
});

test('if value is Option.some, return unboxed value', () => {
  const value = Option.some({ id: 1 });
  const result = handleNullableValue(value);

  expect(result).toEqual({ id: 1 });
});

test('if value is Option.none, return null', () => {
  const value = Option.none();
  const result = handleNullableValue(value);

  expect(result).toBeNull();
});

test('if value is Array, map values to Option and return', () => {
  const value = [Option.some({ id: 1 }), Option.some({ id: 2 })];
  const result = handleNullableValue(value);

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "id": 1,
      },
      {
        "id": 2,
      },
    ]
  `);
});

test('if value is Option.some with array, return array', () => {
  const value = Option.some([{ id: 1 }, { id: 2 }]);
  const result = handleNullableValue(value);

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "id": 1,
      },
      {
        "id": 2,
      },
    ]
  `);
});

test('if value is Option.some with array which elements are Option.some, return array', () => {
  const value = Option.some([Option.some({ id: 1 }), Option.some({ id: 2 })]);
  const result = handleNullableValue(value);

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "id": 1,
      },
      {
        "id": 2,
      },
    ]
  `);
});

test('if value is Option.some with array which elements are Option.some and Option.none, return array', () => {
  const value = Option.some([
    Option.some({ id: 1 }),
    Option.none(),
    Option.some({ id: 2 }),
  ]);
  const result = handleNullableValue(value);

  expect(result).toMatchInlineSnapshot(`
    [
      {
        "id": 1,
      },
      null,
      {
        "id": 2,
      },
    ]
  `);
});
