# Company Route API

## Confirmed contract

The user accepted all interview recommendations and authorized a test project on 2026-09-16.

- `POST /api/routes/company`, success status `200`, `Cache-Control: no-store`.
- Request: `{"origin":{"latitude":13.75,"longitude":100.5}}` (example origin only).
- Origin coordinates must be finite numbers: latitude -90..90 and longitude -180..180. Reject additional fields, including client destination and departure-time overrides.
- Fixed backend destination from `COMPANY_LATITUDE` and `COMPANY_LONGITUDE`; no invented default company coordinates.
- Google Routes API `computeRoutes`, `DRIVE`, `TRAFFIC_AWARE_OPTIMAL`, one recommended route.
- Google encoded overview polyline for displaying the route on Google Maps.
- Permit highways/tolls; prefer avoiding ferries. Google's avoid modifiers are preferences, not absolute guarantees.
- Calculate afresh on every endpoint call, departing now. Omit Google's `departureTime` to use its request time and avoid submitting an already-past timestamp for driving.
- Response: `distanceMeters` (number, meters), `durationSeconds` (number, including fractional seconds), `encodedPolyline` (string).
- Public test endpoint, limited to 10 requests per minute per direct client IP in one server process. `429` includes `Retry-After`. Do not trust arbitrary forwarded IP headers.
- No location history or response cache.

## Error contract

NestJS JSON errors contain `statusCode`, `message` and, where supplied by NestJS, `error`.

| HTTP status | Meaning |
| --- | --- |
| 400 | Invalid coordinates, unexpected request fields, malformed JSON |
| 404 | No driving route found |
| 429 | Per-IP rate limit reached |
| 503 | Missing/invalid server key or destination configuration |
| 502 | Google error, malformed/incomplete response, or fallback without traffic data |
| 504 | Google request/body retrieval exceeded 10 seconds |

Accept `FALLBACK_TRAFFIC_AWARE`; reject fallbacks that do not indicate traffic-aware calculation. Do not expose the Google key or raw upstream errors in responses.

## Test page

- Browser current-location button with explicit user interaction and permission/error handling.
- Manual origin coordinates for testing without geolocation permission.
- Call the endpoint through a local Next.js rewrite to NestJS (`API_BASE_URL`).
- Render Google polyline with Maps JavaScript API, geometry decoding, and advanced endpoint markers.
- Display distance in kilometers, approximate travel time rounded up to minutes, response-received time, and raw API JSON.
- Browser key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `web/.env.local`. Server Routes key: `GOOGLE_MAPS_API_KEY` in `api/.env`.

## NestJS feature organization

`AppModule` imports `RoutesModule` from `api/src/routes/`. The feature module owns `RoutesController`, `RoutesService`, the request/response DTOs, `CompanyRouteRequestPipe`, and `CompanyRouteRateLimitGuard`. Request validation is bound to the controller's body parameter through a NestJS pipe. Route providers are private to this module; the root controller continues to provide `/health`.

The module refactor preserves the existing endpoint, request/response shapes, errors, Google integration, and rate-limit behavior.

## Operational boundaries

This is a local test project. The in-memory limiter resets on restart and is not shared across replicas. The local Next.js proxy shares its upstream IP, so browser clients using that proxy share one route-request allowance. Production proxy/rate-limit design is outside this test project's scope.

No ADR was created: the implementation is reversible, conventional, and does not meet all three ADR criteria.

## Sources

- [Compute Routes REST reference](https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes)
- [Traffic routing preferences](https://developers.google.com/maps/documentation/routes/config_trade_offs)
- [Google Maps loader](https://github.com/googlemaps/js-api-loader)
- [Geometry polyline decoding](https://developers.google.com/maps/documentation/javascript/geometry)
