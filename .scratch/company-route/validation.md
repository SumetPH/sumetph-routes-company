# Validation

## NestJS module refactor (2026-09-16)

- Existing 25 HTTP integration tests pass after separating `RoutesModule`, controller, service, DTOs, request pipe, and guard. Google requests remain mocked.
- API TypeScript check, lint, and NestJS production build also pass after the refactor.
- No new tests or dependencies were added for this structural change.

## Company route implementation

- API TypeScript check, lint, and NestJS production build passed.
- 25 HTTP integration tests passed, with Google requests mocked. Tests cover request mapping, recomputation, invalid input, missing configuration, no-route responses (including omitted protobuf empty arrays), traffic-aware fallback handling, malformed responses, upstream failures, timeout, rate limiting with expiry/Retry-After/forwarded-header bypass protection, and the existing health endpoint.
- Web TypeScript check, ESLint, and production build with `next build --webpack` passed.
- Browser test at http://localhost:3000 verified the Thai test UI and a real POST through the Next.js proxy to NestJS, displaying the expected 503 JSON for missing configuration.
- Live Google route, browser geolocation, and Google map rendering remain unverified because saved api/.env currently contains only PORT; no server Routes key or actual company coordinates are available. A browser-key variable is now present in web/.env.
- Turbopack production build encountered an OS restriction while binding a CSS-worker port. The supported Webpack builder passed without source changes.

- Mobile layout at a 390px viewport was inspected in the browser; document width was 375px with no horizontal overflow.
