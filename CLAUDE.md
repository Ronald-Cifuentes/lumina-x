# CLAUDE.md — LÚMINA

Fictional residential rental portfolio (Spanish UI) built with Next.js 16.4 App Router, React 19.3, TypeScript 6,
Tailwind 4, Motion 14, Drizzle + libSQL (SQLite), Zod 4, Vitest 5 and Playwright 1.64. See README.md for the full guide.

## Commands

- Package manager: pnpm only (`packageManager` pins 11.5.1; lockfile `pnpm-lock.yaml`). Never run npm here or add a
  `package-lock.json`.
- `pnpm install` — dependencies. pnpm 11 fails the install when a new dependency has an install script that is not
  listed under `allowBuilds` in `pnpm-workspace.yaml`; decide with `pnpm approve-builds`.
- `pnpm db:setup` — migrate + idempotent seed (50 properties). `pnpm db:reset` recreates the local file.
- `pnpm dev` — dev server (runs db:setup first). Port 3000 may be taken on this machine; use `pnpm dev -p 3300`.
- `pnpm typecheck && pnpm lint && pnpm test` — fast gates.
- `pnpm build && pnpm test:e2e` — production build + Playwright (isolated `data/e2e.db`, port `E2E_PORT` or 3947).
- `pnpm verify` — every gate in order.

## Rules for changes

- Keep features in `src/features/<domain>`; `src/app` only composes routes. Pure logic takes a `Database` argument so it
  can be tested with `tests/unit/support/database.ts`; `server/repository.ts` wraps it with `server-only` + `getDatabase()`.
- Server Actions must call `requireAdmin()` (admin) or go through `features/leads/service.ts` (public). Never report
  success before the insert resolves.
- The catalogue URL is the single source of truth: change `features/properties/catalog/params.ts` together with
  `server/queries.ts` and their tests.
- Never add a default admin password. Credentials come only from `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH`
  (`pnpm admin:hash`; the hash uses `:` separators because `$` is expanded in `.env` files).
- Changing `src/db/schema.ts` requires `pnpm db:generate` and committing the new file in `drizzle/`.
- Database URL/token come only from `resolveDatabaseConfig()` (`src/db/config.ts`: `DATABASE_*`, then the `TURSO_*`
  names injected by the Vercel Turso integration; `file:` is refused on Vercel). The public origin comes only from
  `resolveSiteUrl()` (`src/shared/config/site-url.ts`). `vercel.json` runs `pnpm db:setup` before every Vercel build.
- Photos: add entries to `src/content/images/catalog.ts` (with Spanish alt text), then `pnpm images:fetch`.

## Next.js 16 specifics used here

- Read `node_modules/next/dist/docs/` before using an unfamiliar API.
- Middleware is `src/proxy.ts`. It sets a per-request CSP nonce, so every page is dynamic (`await connection()` in the
  root layout); do not prerender pages or Next.js scripts lose their nonce.
- `next/image`: use `preload` (not the deprecated `priority`); allowed qualities are `[60, 75]`; formats WebP only.
- `typedRoutes` is on: build dynamic hrefs with `catalogHref()` or cast with `as Route`.
- `PageProps<'/route'>` types come from `next typegen` (run by `pnpm typecheck`).
- ESLint includes the React Compiler rules (`react-hooks/set-state-in-effect`, `refs`, …): derive state instead of
  syncing it in effects.

## Gotchas

- pnpm passes a literal `--` through to the script, so give arguments directly: `pnpm dev -p 3300`,
  `pnpm db:seed --reset`, `pnpm admin:hash "<password>"`. pnpm options go before the script name (`pnpm --silent x`).
- Chromium's IntersectionObserver honours the target's own `clip-path`: observe an unclipped wrapper (see `ImageReveal`).
- In `motion` components, keep the SSR markup identical under reduced motion (switch values, not element trees).
- `FavoriteButton` must not hard-code `position`; callers pass `absolute …` classes.
- axe checks `aria-hidden` text for contrast: decorative numerals use CSS generated content (`data-numeral`).
- Bulk links to dynamic pages (cards, pagination, footer, panels) use `prefetch={false}`: every viewport prefetch of a
  dynamic route triggers a full server render (36 per catalogue scroll before the change).
