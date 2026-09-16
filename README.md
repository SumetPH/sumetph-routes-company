# Company Route — Google Maps test project

ทดสอบเส้นทางรถยนต์จากตำแหน่งปัจจุบันของผู้ใช้ไปพิกัดบริษัทคงที่ พร้อม Google Maps polyline ระยะทาง และเวลาเดินทางตามจราจรปัจจุบัน ผ่าน `POST /api/routes/company`.

Two independent applications in one repository. Each application has its own `package.json` and `pnpm-lock.yaml`; install and run commands inside that application's directory.

## Stack

| Application | Stack | Local URL |
| --- | --- | --- |
| `web` | Next.js 16.3.5, React 19.3.0, Tailwind CSS 4.3.3, shadcn/ui (CLI 4.21.0) | http://127.0.0.1:3000 |
| `api` | NestJS 12.0.3, TypeScript, ESM | http://127.0.0.1:3001/health |

Versions were verified against npm stable `latest` tags on 2026-09-16. Lockfiles record the exact installed versions. Next.js lint tooling uses ESLint 9.39.5 and TypeScript 6.0.3, the newest stable versions within its dependencies' supported peer ranges; the API also uses TypeScript 6.0.3 because TypeScript 7 does not yet provide the programmatic compiler API required by the Nest CLI.

## Requirements

- Node.js 24 LTS recommended (`.node-version` pins 24.21.0). Node.js 22.22.3+ is also supported. NestJS generators require Node 22.22.3+, 24.15.0+, or 26+.
- pnpm 12.4.2, pinned in each application. If needed, install it with `npm install --global pnpm@12.4.2`.

## Development

Run the applications in separate terminals.

```sh
cd web
pnpm install --frozen-lockfile
# First setup only; preserve an existing .env.local:
cp .env.example .env.local
pnpm dev
```

```sh
cd api
pnpm install --frozen-lockfile
# First setup only; preserve an existing .env:
cp .env.example .env
pnpm dev
```

Set `GOOGLE_MAPS_API_KEY`, `COMPANY_LATITUDE`, and `COMPANY_LONGITUDE` in `api/.env`. Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `web/.env.local`. Enable Google Routes API for the server key and Maps JavaScript API for the browser key, with billing configured. Restart both apps after changing environment variables. Keys are ignored by Git; no company coordinates are assumed.

The API reads `.env` during development. `PORT` defaults to 3001; an exported environment variable takes precedence. `API_BASE_URL` in the web environment defaults to http://127.0.0.1:3001. Open http://localhost:3000, get the current location or enter test coordinates, then calculate a route.

See [API setup and curl example](api/README.md), [web setup](web/README.md), and the [confirmed API spec](.scratch/company-route/spec.md).

```sh
curl http://127.0.0.1:3001/health
# {"status":"ok"}
```

`/health` reports that the API responds; it does not check external services.

## Checks and production

Run inside `web`:

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Run inside `api`:

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

API HTTP integration tests cover `/health` and the company route contract, with Google requests mocked. There is no separate web test harness. Production API startup loads `.env` if present and otherwise uses exported environment variables and the default port.

## Structure

```text
web/
  src/app/             # App Router pages, layout, and global styles
  src/components/ui/   # shadcn/ui components
  src/lib/             # Shared web utilities
  components.json      # shadcn/ui configuration
  package.json
  pnpm-lock.yaml
api/
  src/                 # NestJS root module, health controller, and bootstrap
    routes/            # RoutesModule, controller, service, DTO, pipe, and guard
  test/                # HTTP integration tests
  .env.example
  package.json
  pnpm-lock.yaml
.scratch/project-setup/spec.md
```

`web/pnpm-workspace.yaml` only configures dependency build permissions; it does not connect the two applications.

Web imports use the `@/*` alias for `src/*`. To add a shadcn/ui component, run `pnpm exec shadcn add <component>` inside `web`.

The public company route endpoint permits 10 requests/minute per direct IP in one process. Browser clients behind the local Next.js proxy share that allowance. This is a local test project; database, login, deployment, and distributed rate limiting are outside its scope.

## Primary documentation

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Tailwind CSS with Next.js](https://tailwindcss.com/docs/guides/nextjs)
- [shadcn/ui with Next.js](https://ui.shadcn.com/docs/installation/next)
- [NestJS first steps](https://docs.nestjs.com/first-steps)
- [NestJS migration guide](https://docs.nestjs.com/migration-guide)
