# CLAUDE CODE: BUILD LÚMINA REAL ESTATE

You are a senior creative engineer, full-stack architect, interaction designer, and visual quality reviewer. Build a complete, working premium residential rental agency website named **LÚMINA**, with 50 rental properties.

**Execute the project, not just a plan or mockup.** Do not ask questions. Inspect the repository, plan internally, implement, test, correct failures, and deliver the runnable application. Preserve unrelated existing files. Use sensible defaults when details are unspecified.

## 1. Visual direction

Create a luxury architectural editorial experience. The aesthetic should resemble a world-class architecture magazine transformed into a functional rental marketplace.

The visual identity must feel sophisticated, spacious, photographic, restrained, and contemporary.

Design tokens:

- Background: warm ivory `#F6F2EB`
- Primary text: charcoal `#20231F`
- Accent: muted bronze `#94775D`
- Secondary accent: sage `#7F8B7B`
- Surfaces: soft white `#FFFEFA`
- Headings: Cormorant Garamond or a compatible premium editorial serif
- Interface: Manrope
- Generous negative space, elegant hairline dividers, subtle borders
- Asymmetrical grids, large editorial numbering, understated CTAs

Avoid generic SaaS visuals, gradients everywhere, repetitive cards, excessive rounded corners, and stock-template compositions.

## 2. Technology

Use the current stable and mutually compatible versions of:

- Next.js App Router
- React, TypeScript, Tailwind CSS
- Motion for React, imported from `motion/react`
- Lucide React
- Drizzle ORM and SQLite for a self-contained local application
- Zod for validation
- Vitest for logic tests
- Playwright for browser end-to-end tests

Check installed versions and relevant documentation before writing integration code. Prefer Server Components for listing content and small Client Components for interactions. Keep SEO-critical content server-rendered.

Use semantic HTML, responsive image optimization, accessible controls and design tokens. Do not install multiple animation libraries unless a concrete requirement demands it.

## 3. Landing page: highest design priority

Create a visually memorable homepage, not a simple hero followed by generic cards.

**Hero: architectural depth composition**

- Nearly full viewport height, responsive to dynamic viewport units.
- Large architectural photograph showing an exceptional contemporary residence.
- Oversized editorial headline: **"No buscas un inmueble. Buscas cómo quieres vivir."**
- Subheading describing curated rental homes in Medellín and surrounding municipalities.
- Main CTA: **"Explorar propiedades"**.
- Secondary CTA: **"Agenda una asesoría"**.
- Floating search panel with location, rental budget and property type.
- Minimal floating navigation with logo, properties, locations and contact.
- Clear scroll indicator.

Create three distinct visual depth planes: architectural background, intermediate translucent architectural fragment, and foreground heading/search content.

The planes must move at different scroll speeds through Motion's `useScroll`, `useTransform` and optional `useSpring`. Suggested restrained ranges: background `-45px`, middle `-110px`, foreground `-20px`, normalized to the hero's scroll progress.

The scroll must reveal the next section naturally, without jump cuts, overflow artifacts or blocking native scrolling.

**Architectural storytelling section**

Create an asymmetric composition with full-bleed images and substantial editorial typography.

One image remains sticky during a short storytelling sequence while the accompanying descriptions change. Use animated image clipping, subtle text reveals and carefully managed overlap.

Copy direction: **"Espacios que transforman lo cotidiano."**

**Featured residences**

Show 6 featured properties in a premium editorial gallery. Alternate large and compact photographs with restrained metadata. Each property must open its real dynamic detail page.

**Neighborhood exploration**

Create large photographic editorial panels for El Poblado, Laureles, Envigado and Sabaneta. Each panel filters the catalog to the corresponding area.

**Trust and conversion**

Include a concise explanation of the rental process, a functional owner acquisition CTA, an inquiry CTA and a thoughtful footer.

Do not invent ratings, testimonials, transaction statistics, accreditations or client brands.

## 4. Rental storefront

Route: `/propiedades`

This is the principal commercial experience and must receive the same visual quality as the landing page.

Requirements:

- Desktop: elegant 3-column grid with photographic cards.
- Tablet: 2 columns.
- Mobile: 1 column with clear filtering access.
- Search by title, municipality and neighborhood.
- Filters for monthly rent range, property type, bedrooms, bathrooms, parking, furnished status, pets and availability.
- Sorting by rent ascending/descending, area and newest.
- Active filter indicators, clear-all action and live result count.
- Shareable URL query parameters for filters and sorting.
- Pagination or load-more mechanism that preserves filters and URL history.
- Useful empty state with reset action.
- Favorites persisted locally for visitors.
- Property images that load reliably or show a designed fallback.

Card composition: generous photographic area, status label, rent in COP, administration fee shown separately, location, area, bedrooms and bathrooms. Use an attractive hover image reveal and small positional motion without compromising readability.

At least one featured storefront section must use an editorial horizontal carousel with native touch support, keyboard-friendly controls and visible progress.

No purchase cart or fake checkout: this is a rental business.

## 5. Property detail pages

Route: `/propiedades/[slug]`

Each of the 50 properties must have its own working page, including:

- Editorial image gallery with fullscreen lightbox
- Title, neighborhood, municipality, area and rental price
- Administration fee, when present
- Bedrooms, bathrooms, parking and amenities
- Authentic-to-dataset but explicitly fictional descriptions
- Availability badge
- Collapsible features and detailed information
- Functional contact form
- Schedule-a-visit request
- WhatsApp CTA using a configurable business number
- Similar properties based on type, area and budget

Keep the primary contact CTA accessible on mobile. The user should never be forced to complete an animation to access a property's information.

## 6. Data model and 50-property seed

Create exactly 50 distinct, deterministic property records for local demonstration.

Use varied fictional listings in Medellín, Envigado, Sabaneta and Itagüí, with Colombian pesos and plausible but explicitly illustrative prices.

Each record must contain an ID, unique slug, name, municipality, neighborhood, type, area, bedrooms, bathrooms, parking, rent, administration fee, availability, amenities, images, description and featured flag.

Include apartments, studios, houses and lofts across different budgets. Use different layouts and substantive descriptions rather than changing only a number.

Create 50 distinct cover images using legitimately reusable architectural photography when available, with visible demo-image labeling or a general inventory disclaimer. Validate image loading. If licensing or retrieval is uncertain, use original designed placeholders instead of broken or unauthorized imagery.

Do not present fictional homes, addresses, prices or availability as real offerings. Add a discreet, visible **"Portafolio demostrativo"** notice.

Create idempotent database migrations and a seed script. Re-running seed must not create duplicates. Public pages must query the same canonical dataset.

## 7. Functional rental workflows

Implement:

- Property inquiries saved persistently in SQLite.
- Visit requests with preferred date and time, clearly marked as requests rather than confirmed bookings.
- Owner property-submission form.
- Server-side validation, honeypot or equivalent spam protection, and rate limiting.
- Consent checkbox with an accessible privacy notice.
- Success, loading and error states.
- No fake success messages if persistence fails.
- Server-side sanitation and safe rendering.

Create a protected minimal administration area for managing property records, availability and received inquiries. Require credentials configured through environment variables; do not expose the administration interface through a default public password. Implement secure sessions and authorization checks.

Document how to switch from the local database to a durable managed database before production deployment. Do not describe SQLite stored on an ephemeral deployment filesystem as production persistence.

## 8. Motion system

Create reusable components for:

- `ParallaxMedia`
- `RevealText`
- `ImageReveal`
- `ScrollProgress`
- `StaggeredPropertyGrid`
- `AnimatedFilterPanel`

Motion guidelines:

- Prefer transform and opacity.
- Use clipping selectively, not on every card.
- Animate listing layout changes without jarring jumps.
- Disable large spatial motion and autoplay media under `prefers-reduced-motion`.
- Avoid scroll-jacking and global smooth-scroll interception.
- Do not animate all 50 property cards continuously.
- Test touch scrolling on mobile.
- Keep controls usable while transitions run.

A motion effect is acceptable only when it improves the hierarchy, demonstrates spatial depth or gives useful interaction feedback.

## 9. SEO, performance and accessibility

Implement dynamic page titles, descriptions, canonical URLs, Open Graph metadata, robots and sitemap generation.

Use the appropriate semantic structured data only where its properties genuinely describe the content. Avoid unsupported rich-result claims.

Optimize the hero image, reserve media dimensions to prevent layout shifts, lazy-load below-the-fold galleries and avoid client-rendering the entire property dataset unnecessarily.

Target WCAG 2.2 AA conventions, keyboard-operable filtering, accessible dialogs and sensible focus restoration.

## 10. Verification and completion

Implement and run checks proving that:

1. The database contains exactly 50 unique properties.
2. All property routes resolve.
3. Search, combined filters, sorting and pagination work together.
4. Favorites persist after reload.
5. Inquiry and visit-request submissions are validated and actually persisted.
6. Invalid submissions fail safely.
7. Admin routes reject unauthenticated users.
8. The mobile navigation, filter drawer and image gallery function.
9. Reduced-motion preferences are honored.
10. Typecheck, lint, automated tests and production build pass.

Use Playwright to inspect desktop and mobile renderings when browser tooling is available. Fix visibly broken layouts and report any verification that could not be run.

Create a concise `CLAUDE.md`, `.env.example`, `README.md`, seed command and verification scripts.

**Completion rule:** Stop when the requirements pass their tests and the application is runnable. Do not spend additional iterations on subjective refinements after the acceptance gates pass.

Final report: implemented routes, database count, commands executed, test outcomes, screenshots if available, limitations and exact startup commands.

Build the application now.