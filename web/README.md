# Web

Next.js App Router application with TypeScript, Tailwind CSS, and shadcn/ui. See the [root README](../README.md) for requirements and stack versions.

From this directory:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. No environment variables are required.

```sh
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

Add UI components with `pnpm exec shadcn add <component>`. The `@/*` alias maps to `src/*`.
