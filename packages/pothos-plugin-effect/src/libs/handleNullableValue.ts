import { Function, Option } from 'effect';

export type InferNullableType<Value> = Value extends Option.Option<infer T>
  ? T extends Array<Option.Option<infer U>>
    ? (U | null)[] | null
    : T | null
  : Value extends Array<Option.Option<infer T>>
    ? Array<T | null>
    : Value;

export type InferNullableTypeShape<Value> = NonNullable<Value> extends infer T
  ? T extends (infer U | null)[]
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
