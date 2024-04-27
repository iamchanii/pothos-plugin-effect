import { Option } from 'effect';

export type InferValueType<
  Value,
  Nullable = false,
> = Value extends Option.Option<infer T>
  ? InferValueType<T, true>
  : Value extends (infer T)[]
    ? Nullable extends true
      ? InferValueType<T>[] | null
      : InferValueType<T>[]
    : Nullable extends true
      ? Value | null
      : Value;
