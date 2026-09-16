# Company Route Test Page

Next.js / React / TypeScript. See the [root README](../README.md) for the stack and prerequisites.

```sh
pnpm install --frozen-lockfile
# For first setup only, if .env.local does not already exist:
cp .env.example .env.local
pnpm dev
```

Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local` to a browser key with Maps JavaScript API and billing enabled. Restrict it to the local site's HTTP referrers. This browser key is intentionally public; keep the backend Routes key in `api/.env`. `API_BASE_URL` defaults to http://127.0.0.1:3001. Restart web after changing environment variables; the browser key is embedded at build time.

Open http://localhost:3000 with NestJS running. Click “ใช้ตำแหน่งปัจจุบัน” and allow browser location access, or enter manual origin coordinates. Click “คำนวณเส้นทาง” to make a fresh request and display the Google map, distance, estimated travel time, and JSON response. Location permission requires localhost or HTTPS. API testing works even without a browser map key.

The local Next.js rewrite forwards only `/api/routes/company` to NestJS. It does not perform route calculation itself. All browser clients behind this local proxy share the API's upstream IP rate limit.

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

If the execution environment restricts Turbopack's CSS-worker ports, verify using Next.js's supported alternate builder: `pnpm exec next build --webpack`.
