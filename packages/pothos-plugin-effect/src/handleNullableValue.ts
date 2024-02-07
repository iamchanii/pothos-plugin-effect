import { Function, Option } from 'effect';

export type InferEffectValueType<
  Value,
  Nullable = false,
> = Value extends Option.Option<infer T>
  ? InferEffectValueType<T, true>
  : Value extends (infer T)[]
    ? Nullable extends true
      ? InferEffectValueType<T>[] | null
      : InferEffectValueType<T>[]
    : Nullable extends true
      ? Value | null
      : Value;

export function handleNullableValue<
  Value,
  TReturn extends InferEffectValueType<Value>,
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
