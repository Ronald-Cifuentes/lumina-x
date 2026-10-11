# LÚMINA — residential rental portfolio (demo)

A complete, runnable rental storefront for Medellín and the Aburrá Valley: an editorial landing page, a filterable
catalogue of **50 fictional properties**, a detail page for each one, persisted lead workflows and a protected
administration area.

> **Portafolio demostrativo.** LÚMINA is a fictional brand. Homes, prices, availability and descriptions are invented;
> neighbourhood names are real places used only as context. Photographs come from Unsplash (Unsplash License) and do
> not depict the listings. The site says so in the header, the catalogue, every detail page and the footer.

## Stack

| Area | Choice (installed version) |
| --- | --- |
| Framework | Next.js 16.4.0 (App Router, Turbopack), React 19.3.0 |
| Language / style | TypeScript 6.0.3, Tailwind CSS 4.3.3 |
| Motion / icons | Motion 14.1.0 (`motion/react`), lucide-react 1.55.0 |
| Data | Drizzle ORM 0.45.4 + libSQL client 0.18.0 on a local SQLite file |
| Validation | Zod 4.6.5 |
| Tests | Vitest 5.0.3, Playwright 1.64.0, axe-core 4.13 |
| Package manager | pnpm 11.5.1 (pinned in `packageManager`; lockfile `pnpm-lock.yaml`) |

TypeScript 7 and ESLint 10 exist but are not mutually compatible with this toolchain yet: `typescript-eslint` accepts
TypeScript `<6.1`, and the React/import/a11y ESLint plugins bundled by `eslint-config-next` declare ESLint `≤9`.

## Quick start

```bash
pnpm install
cp .env.example .env.local          # then edit the values
pnpm admin:hash "a-long-unique-password"   # paste the printed ADMIN_PASSWORD_HASH into .env.local
pnpm db:setup                       # applies migrations and seeds the 50 properties (idempotent)
pnpm dev                            # http://localhost:3000 (runs db:setup first); another port: pnpm dev -p 3300
```

Production mode locally:

```bash
pnpm build
pnpm start                          # or: pnpm start -p 3200
```

Node.js ≥ 22.12 is required (verified on Node 26.0.0), with pnpm 11 (verified on 11.5.1). Node.js 25 and later no
longer bundle Corepack, so install pnpm on its own: see <https://pnpm.io/installation>.

The project uses pnpm only; do not run npm or commit a `package-lock.json`. Two pnpm behaviours matter here:

- Arguments go straight after the script name, without `--`: pnpm passes a literal `--` through to the script
  (`pnpm dev -p 3300`, `pnpm db:seed --reset`).
- pnpm 11 stops the install when a dependency's install script is neither allowed nor denied. `pnpm-workspace.yaml`
  denies the scripts of `esbuild` and `unrs-resolver`, which only check native binaries that pnpm already installs.
  Decide for any new one with `pnpm approve-builds`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev` / `build` / `start` | Next.js; `dev` and `start` run `db:setup` first |
| `pnpm db:setup` | Applies migrations and inserts missing canonical properties (never duplicates, keeps admin edits) |
| `pnpm db:seed --reset` | Restores the canonical values of the 50 properties (by slug) |
| `pnpm db:reset` | Deletes the **local** SQLite file and recreates it (refuses remote URLs) |
| `pnpm db:generate` | Generates a new SQL migration from `src/db/schema.ts` (drizzle-kit) |
| `pnpm verify:data` | Checks 50 rows, unique slugs, unique covers and that every image file exists |
| `pnpm typecheck` / `lint` | `next typegen && tsc --noEmit` / ESLint flat config |
| `pnpm test` | Vitest unit and integration tests (temporary SQLite databases) |
| `pnpm test:e2e` | Playwright against `next start` with an isolated database (`data/e2e.db`); run `pnpm build` first |
| `pnpm verify` | typecheck → lint → unit tests → seed → data check → build → e2e |
| `pnpm images:fetch` | Re-downloads and re-encodes the photo catalogue (skips existing files) |
| `pnpm admin:hash "<password>"` | Prints an `ADMIN_PASSWORD_HASH` (scrypt); without an argument it generates a password |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing: three-plane parallax hero, sticky storytelling, six featured homes, four neighbourhood panels, process, CTAs |
| `/propiedades` | Storefront: search, 8 filter groups, sorting, pagination, chips, live count, editorial carousel |
| `/propiedades/[slug]` | 50 detail pages: gallery + lightbox, facts, collapsible details, inquiry and visit forms, WhatsApp, similar homes |
| `/favoritos` | Favourites stored in `localStorage` |
| `/contacto` | “Agenda una asesoría” request |
| `/propietarios` | Owner property submission |
| `/privacidad`, `/creditos` | Privacy notice (Ley 1581 de 2012) and photo credits |
| `/admin/*` | Login, dashboard, property records (availability, featured, published, editing) and received leads |
| `/api/propiedades?slugs=` | Read-only card data for favourites |
| `/sitemap.xml`, `/robots.txt` | Generated from the database |

## Architecture

```
src/
  app/                 routes only: (site) public pages, admin/, api/, sitemap, robots, proxy-aware root layout
  features/
    properties/        domain types, catalogue params, queries, similarity, JSON-LD, cards, storefront and detail UI
    leads/             Zod schemas, lead service (validation → honeypot → rate limit → insert), Server Actions, forms
    admin/             scrypt passwords, DB sessions, auth DAL, admin repository, actions and forms
    favorites/         localStorage store (useSyncExternalStore), button, favourites view
    landing/           hero, storytelling, featured, neighbourhoods, process, CTAs
    motion/            ParallaxMedia, RevealText, ImageReveal, ScrollProgress, StaggeredPropertyGrid, AnimatedFilterPanel
  db/                  Drizzle schema, libSQL client, migrations runner, canonical 50-listing seed
  content/images/      photo catalogue (Unsplash ids, alt text) and generated manifest (sizes, blur placeholders)
  shared/              env validation, formatting, sanitising, rate limiting, layout, form kit, SEO helpers
  proxy.ts             per-request CSP nonce + optimistic /admin redirect (Next 16 "proxy", formerly middleware)
drizzle/               SQL migrations (tracked in __drizzle_migrations, so re-running is a no-op)
tests/unit, tests/e2e  Vitest and Playwright suites
```

Listing content is rendered by Server Components; client components are limited to interactions (filters, favourites,
gallery, forms, motion). Every page is rendered per request because the proxy issues a fresh CSP nonce, so admin edits
appear immediately.

## Data model and seed

`properties` stores the 50 records (id, slug, name, type, municipality, zone, neighbourhood, layout, area, rooms,
parking, stratum, floor, rent, nullable administration fee, furnished, pets, availability, amenities, images,
summary, description, featured, published, publication date and a normalised `search_text` for accent-insensitive
search). `inquiries` holds property inquiries, visit requests and advisory requests; `owner_submissions` holds owner
forms; `rate_limits` and `admin_sessions` support security.

The seed (`src/db/seed/listings.ts`) is deterministic: each listing has its own hand-written lead paragraph, a zone
context paragraph and an explicit fiction notice. Seeding inserts by unique slug with `ON CONFLICT DO NOTHING`, so
running it again never duplicates rows; `--reset` upserts canonical values.

## Security

- **Admin access** exists only when `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` are set; there is no default password.
  Passwords are verified with scrypt and a constant-time comparison; logins are rate limited per client and globally.
- **Sessions** are random 256-bit tokens in an `httpOnly`, `SameSite=Lax` cookie (`Secure` and `__Host-` prefix on
  https). Only the SHA-256 of the token is stored, with an 8-hour expiry. Every admin page and every Server Action
  re-checks the session on the server; the proxy redirect is only an optimisation.
- **Forms** validate with Zod on the server, strip control characters and angle brackets, reject honeypot submissions,
  verify the property, enforce per-client and global rate limits in SQLite, and only report success after the insert
  succeeds. Consent is an explicit, unticked checkbox with an accessible notice; its time and version are stored.
- **Headers**: nonce-based CSP with `strict-dynamic`, `frame-ancestors 'none'`, `nosniff`, referrer and permissions
  policies. JSON-LD is serialised with `<` escaped.
- **Known limit**: the per-client key comes from `X-Forwarded-For`. Without a trusted proxy that overwrites the header
  (Vercel does), a client can spoof it; the global per-form ceiling still bounds abuse.

## Deploying with a durable database (Vercel + Turso)

The local SQLite file is for development and demos. Do **not** treat a SQLite file on an ephemeral or multi-instance
deployment filesystem (Vercel, most containers) as production persistence: it is lost on redeploys and not shared
between instances. On Vercel the app refuses it: `resolveDatabaseConfig` (`src/db/config.ts`) throws when `VERCEL` is
set and the database URL is a `file:` URL, so the build stops with an explicit message instead of publishing pages
that cannot load their data.

The app uses the libSQL client, so the supported path is a managed libSQL database such as Turso:

1. Add the Turso integration from the Vercel Marketplace (project → Storage) and connect the database to the project.
   The app reads `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` when `DATABASE_URL` is empty; any other libSQL provider
   works through `DATABASE_URL` + `DATABASE_AUTH_TOKEN`, which take precedence.
2. `vercel.json` sets the build command to `pnpm db:setup && pnpm build`, so every deployment applies pending
   migrations and inserts missing canonical properties before building (idempotent; admin edits are kept). Preview
   deployments use the same database when the variables are also defined for Preview.
3. `SITE_URL` is optional on Vercel: without it, canonical URLs, Open Graph, the sitemap and secure cookies use the
   project's production domain (`VERCEL_PROJECT_PRODUCTION_URL`). Set it when a custom domain is added.
4. Optional: `ADMIN_EMAIL` + `ADMIN_PASSWORD_HASH` enable `/admin`; `WHATSAPP_BUSINESS_NUMBER` shows the WhatsApp button.
5. Environment variables apply only to new deployments: redeploy after changing them.
6. Back up the database with the provider's point-in-time recovery or scheduled exports.

To run the database scripts against the remote database from a local shell, export the same variables first.

To use PostgreSQL instead, port `src/db/schema.ts` to `drizzle-orm/pg-core`, switch the client in `src/db/client.ts`
to a Postgres driver, regenerate migrations with drizzle-kit and keep the repositories unchanged (they only use
Drizzle's query builder; the `LIKE … ESCAPE` search and the rate-limit UPSERT have Postgres equivalents).

## Testing and verification

- **Unit/integration (Vitest, 83 tests)**: dataset integrity, idempotent seed, catalogue parsing and SQL semantics against a
  reference implementation, sorting and pagination, lead validation and persistence (including honeypot, rate limit and
  failed writes), password hashing, sessions, rate limiting, formatting, structured data, and the database/site URL
  resolution used on Vercel.
- **End-to-end (Playwright, desktop 1440×900 and Pixel 7)**: 50 routes from the sitemap return 200 with canonical tags;
  unknown slugs return 404; search + filters + sorting + pagination + history; favourites after reload; inquiry, visit,
  advisory and owner submissions verified directly in the database; invalid and honeypot submissions store nothing;
  admin routes reject anonymous and forged sessions; admin edits show on public pages; mobile menu, filter drawer,
  gallery and lightbox; touch scrolling via Chrome DevTools Protocol; parallax planes and reduced motion; axe-core
  WCAG 2.2 AA scans; performance safeguards (hero preloaded and measured as LCP, lazy below-the-fold images, CLS < 0.1 on
  home, catalogue and detail pages, catalogue HTML limited to the visible page); screenshots saved in `docs/screenshots/`.
- The e2e server listens on port `3947` by default; override with `E2E_PORT=4000 pnpm test:e2e`.
- `tests/e2e/global-setup.ts` warms the Next.js image cache for desktop and mobile before the suite, because the first
  on-demand optimisation of each image is slow on a fresh server.
- `scripts/e2e-server.mjs` supervises `next start` during the suite: if the operating system kills it (seen on a
  heavily swapping machine), the exit code/signal is logged and the server restarts; Playwright retries a failed test
  once and reports it as *flaky*, so restarts never hide a failure silently.

## Limitations

- Content, prices and availability are fictional; photographs are illustrative stock images.
- Visit requests are requests: nobody is notified by e-mail and no calendar is booked.
- Image optimisation runs on the Next.js server (WebP); use a CDN in production.
- Rate limiting uses the request IP header as described above.
