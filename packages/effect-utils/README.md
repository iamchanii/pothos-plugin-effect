# effect-utils

A utility for working with Effect. This package is intended for internal use only.

## API

### `executeEffect(effect, runtime?)`

Execute the given Effect using `runPromiseExit`. It returns the value when result is `Exit.Success<A>`. and it throws the value if result is failure.

And it resolve `Option<A>` value into `A | null`.

## License

MIT
