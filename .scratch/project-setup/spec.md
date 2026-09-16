# Project setup

Status: Implemented and validated; authorized by the user's `implement` request.

## Confirmed scope

- `/web`: Next.js, Tailwind CSS, shadcn/ui, TypeScript, App Router, `src/`, and the `@/*` import alias.
- `/api`: NestJS with TypeScript.
- Each app has its own package manifest and lockfile. No workspace shared between the applications.
- Use pnpm independently in each app, with one `pnpm-lock.yaml` per app and no root package manifest.
- Use the latest stable releases verified at setup time; exclude prereleases.

## Implementation

- `/web`: scaffold the Next.js application and initialize shadcn/ui with a starter page demonstrating a Button component. Run locally on port 3000.
- `/api`: scaffold the NestJS application and expose `GET /health` returning a simple service status. Run locally on port 3001.
- Provide independent dev, build, and lint scripts in each app.
- Provide Prettier with `format` and `format:check` scripts in each app. Exclude generated files and lockfiles, preserve each app's existing formatting style, and require agents to format edited files before final validation and handoff.
- Add root README setup and run instructions, appropriate ignore rules, and environment examples only where configuration is needed.
- Verify dependency installation, production builds, lint, and local HTTP responses for both applications.

## Excluded from this setup

- Google Maps dependencies, configuration, keys, and UI.
- Database, authentication, and application business features.

## Validation seams

The agreed public API boundary is `GET /health`, returning HTTP 200 and `{ "status": "ok" }`. Adapt the generated HTTP integration test to this contract, run it failing before implementation, then run it passing. Validate the web starter through typechecking, lint, build, and a local HTTP response; no additional web test harness is needed for this scaffold.

## Version research (2026-09-16)

Latest stable versions reported by primary npm sources during the interview:

| Dependency   | Version | Source                                                          |
| ------------ | ------- | --------------------------------------------------------------- |
| Next.js      | 16.3.5  | https://registry.npmjs.org/next/latest                          |
| React        | 19.3.0  | https://registry.npmjs.org/react/latest                         |
| Tailwind CSS | 4.3.3   | https://registry.npmjs.org/tailwindcss/latest                   |
| shadcn CLI   | 4.21.0  | https://www.npmjs.com/package/shadcn                            |
| NestJS core  | 12.0.3  | https://www.npmjs.com/package/%40nestjs/core?activeTab=versions |

Installed Node.js 22.22.3 meets the documented Next.js and NestJS generation requirements. Recheck dependency versions during installation and record resolved versions in each app's lockfile.

Final installed stack versions match the table above. Both apps pin pnpm 12.4.2. The generated Next template initially selected React 19.2.8; it was upgraded to stable latest React 19.3.0. Both apps use TypeScript 6.0.3: Next.js ESLint tooling requires TypeScript below 6.1, and Nest CLI cannot build using TypeScript 7.0.2 because that release lacks its required programmatic compiler API. Web ESLint is 9.39.5, the newest release within the Next config plugins' supported peer ranges. Both apps pass `pnpm peers check`.

The web-local `pnpm-workspace.yaml` contains only dependency build permissions, with no workspace package definitions or connection to `/api`.

## Validation results

Checked on Node.js 22.22.3 using pnpm 12.4.2:

- Both applications: frozen-lockfile installation, typecheck, lint, peer checks, and production build passed.
- API HTTP integration test: red with HTTP 404 before adding `/health`; green afterward.
- Final full API test suite: 1 file, 1 test passed.
- Development runtime: web starter HTML and shadcn Button link served with HTTP 200 at `http://127.0.0.1:3000`; API `/health` returned HTTP 200 with the expected JSON at port 3001. API watch build reported no errors.
- Production runtime: both `pnpm start` commands launched successfully; web HTML and all 8 referenced CSS/JS assets returned HTTP 200, and API `/health` returned the expected JSON.
- Browser rendering and client interaction were not exercised. HTTP checks establish server responses and asset availability.
- Two-axis staged-diff review: Standards 0 findings, Spec 0 findings; see [review.md](./review.md).

The machine's existing IPv6 localhost port 3000 serves another project. Validation and README URLs use `127.0.0.1` to reach this Next.js server without changing the other project.

## Documentation boundaries

No project-specific domain terms have been resolved, so no `CONTEXT.md` is needed yet. Framework and folder choices do not belong in the domain glossary. No ADR is warranted for this conventional scaffold: the choices do not meet all three criteria of being costly to reverse, surprising without context, and resolving a real trade-off.

## Interview history

### Round 1

The user chose separate manifests and lockfiles, accepted TypeScript and Next.js App Router with `src/` and `@/*`, and expanded the initial scope to include Google Maps.

### Round 2

The user chose pnpm independently for each app and withdrew Google Maps from this setup. Map interactions and API position handling are therefore no longer open questions.

### Implementation authorization

The user invoked `implement` after the final scope review. Review baseline: `0f1a8b2545b4399547d4f62fb87b5761562d7934` (HEAD immediately before implementation). Commit to the current `main` branch after validation and the two-axis review.
