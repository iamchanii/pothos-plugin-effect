# graphql-effect

Make your GraphQL Schema to allow use Effect.

## Install

```
$ yarn add graphql-effect
```

## Usage

```ts
import { enableExecuteEffect } from "graphql-effect";

declare const yourSchema: import("graphql").GraphQLSchema;
const schema = enableExecuteEffect(yourSchema);
```

## API

### `enableExecuteEffect(schema, runtime?)`

Converts the given `GraphQLSchema`. The `Effect.Effect` will be available as a result of the field resolver.

## License

MIT
