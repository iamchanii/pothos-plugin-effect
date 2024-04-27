import { Function, Option } from 'effect';
import { InferValueType } from './types.js';

export function handleNullableValue<
  Value,
  TReturn extends InferValueType<Value>,
>(value: Value): TReturn {
  if (Option.isOption(value)) {
    return Option.match(value, {
      onNone: Function.constNull,
      onSome: (value) => {
        return Array.isArray(value) ? value.map(handleNullableValue) : value;
      },
    }) as TReturn;
  }

  if (Array.isArray(value)) {
    return value.map(handleNullableValue) as TReturn;
  }

  return value as unknown as TReturn;
}
