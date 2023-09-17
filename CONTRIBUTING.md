## Install

```sh
pnpm install
```

## Run tests

```sh
pnpm test
```

This command will be remove `./prisma/dev.db` (if exists), run `prisma db push` to create new `dev.db` and setup database data to running test cases about Prisma plugin integration.
