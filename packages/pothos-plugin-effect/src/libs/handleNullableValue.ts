import { Function, Option } from 'effect';

export type NullableValue<T = any> =
  | Option.Option<Option.Option<T>[]>
  | Option.Option<T[]>
  | Option.Some<T>[]
  | (T | null)[]
  | T
  | null;

export type InferNullableType<Value> = Value extends NullableValue<infer T>
  ? T extends Option.Option<infer U>
    ? U
    : T
  : never;

export function handleNullableValue<
  Value,
  TReturn extends InferNullableType<Value>,
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
