# API

NestJS TypeScript application using ESM. See the [root README](../README.md) for requirements and stack versions.

From this directory:

```sh
pnpm install --frozen-lockfile
cp .env.example .env
pnpm dev
```

`GET http://127.0.0.1:3001/health` returns `{"status":"ok"}`. Set `PORT` in `.env` or export it to change the default port. Development loads `.env`; production loads it if present.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

`pnpm test` runs the HTTP integration tests. `pnpm start` runs the compiled `dist/main.js`, so build first.
