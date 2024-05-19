# effect-utils

effect-utils is a simple library for using [Effect](https://effect.website). This library was created to handle the internal logic of [pothos-plugin-effect](packages/pothos-plugin-effect) and is intended for internal use. Care should be taken when using it for other purposes.

## API

### `executeEffect(effect, runtime?)`

Execute the given Effect using `Runtime.runPromiseExit`. It returns the value when result is `Exit.Success<A>`. and it throws the value if result is failure.

And it resolve `Option<A>` value into `A | null`.

### `executeStream(stream, runtime?)`

Runs the given stream using `Stream.runForEach' and returns the AsyncIterable that was created using the [Repeater.js](https://repeater.js.org/).

And it resolve `Option<A>` value into `A | null`.

### `isStream`

Determine whether the value is a stream or not.

## License

MIT
