# Company Route API

NestJS 12 / TypeScript / ESM. See the [root README](../README.md) for setup and the [feature spec](../.scratch/company-route/spec.md) for the contract.

## Module structure

`AppModule` imports `RoutesModule`. The routes feature owns its controller, service, request validation pipe, and rate-limit guard; its providers are scoped to the module.

References: [NestJS feature modules](https://docs.nestjs.com/modules), [NestJS pipes](https://docs.nestjs.com/pipes).

```text
src/
  app.module.ts
  app.controller.ts                # GET /health
  main.ts
  routes/
    routes.module.ts
    routes.controller.ts           # HTTP endpoint and DTO binding
    routes.service.ts              # Google request and response handling
    dto/company-route.dto.ts       # Request/response types
    pipes/company-route-request.pipe.ts
    guards/company-route-rate-limit.guard.ts
    utils/validation.ts
```

Request validation runs in the NestJS pipe before the service is called. The HTTP contract remains `POST /api/routes/company`.

## Run locally

```sh
pnpm install --frozen-lockfile
# For first setup only, if .env does not already exist:
cp .env.example .env
pnpm dev
```

Configure `GOOGLE_MAPS_API_KEY`, `COMPANY_LATITUDE`, and `COMPANY_LONGITUDE` in `.env`. Enable Google Routes API and billing for the server key. `PORT` defaults to 3001. Restart the API after changing `.env`.

```sh
curl http://127.0.0.1:3001/api/routes/company \
  -H 'Content-Type: application/json' \
  -d '{"origin":{"latitude":13.75,"longitude":100.5}}'
```

Example response (illustrative values):

```json
{
  "distanceMeters": 12500,
  "durationSeconds": 1800,
  "encodedPolyline": "<Google encoded polyline>"
}
```

The endpoint returns one car route to the fixed company destination with current traffic, permitting highways/tolls and preferring to avoid ferries. Every request makes a new Google call. Google sets departure to its request time. Only origin coordinates are accepted; no client destination or departure override.

Errors: `400` invalid input, `404` no route, `429` request limit, `503` missing configuration, `502` Google failure/non-traffic fallback, `504` timeout (10 seconds). Server keys and raw Google errors are never returned.

The test-project limiter permits 10 requests/minute per direct IP and sends `Retry-After` when exceeded. It is in-memory per process. The local Next.js proxy makes browser clients share a limit; arbitrary forwarded headers do not bypass it.

`GET /health` still returns `{"status":"ok"}` and does not check Google configuration. Local CORS permits http://localhost:3000 and http://127.0.0.1:3000.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

HTTP tests mock Google and need temporary loopback ports. `pnpm start` runs `dist/main.js` and loads `.env` if present; build first.
