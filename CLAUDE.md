
# Project: [ERVFlow]

## Tech Stack
- [Framework], [Language + version]
- [Database], [Key libraries]

## Commands
- Dev: [command]
- Build: [command]
- Test: [command]
- Lint: [command]

## Architecture
- [Where services live]
- [Where routes/views live]
- [Where models/types live]
- [Where tests live]

## Code Style
- [Rule 1 — be specific]
- [Rule 2 - make change what is prompted for ]
- [Rule 3 - always follow the folder/file structure and use the already available components ]

## Rules
- ALWAYS run tests after changes
- ALWAYS use TypeScript strict mode
- NEVER commit directly to main
- Keep files under 300 lines — split if larger

## Read and follow
- Do not expand scope beyond the files explicitly mentioned.
- Ask for approval before inspecting additional files.
- Follow same Table structure added on other pages [@tanstack/react-table].
- Use reusable component as possible.



## 1. Project Overview

**ERVFlow** is a multi-tenant SaaS platform (CMS + CRM + more modules).

| Layer | Tech | Location |
|---|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS 3 | `apps/web/src/` |
| Backend | NestJS 10, Prisma 5, PostgreSQL 16 | `apps/api/src/` |
| Shared types | `@vyntra/types` — build before API | `libs/types/` |
| Package manager | **pnpm only** — never npm/yarn | root `pnpm-lock.yaml` |

---

## 2. Commands

```bash
# Dev
pnpm dev           # all packages in parallel
pnpm dev:web       # Next.js only → http://localhost:3000
pnpm dev:api       # NestJS only  → http://localhost:3001/api

# Build
pnpm build         # build:types → build:web → build:api
pnpm build:types   # MUST run before API builds/starts

# Database (Homebrew Postgres 16 — no Docker on this Mac)
# role: vyntra / vyntra_dev_password   db: vyntra_db
pnpm db:migrate    # apply pending migrations
pnpm db:seed       # seed test data
pnpm db:studio     # Prisma Studio UI

# Quality
pnpm lint          # ESLint (web + api)
pnpm type-check    # tsc --noEmit (web + api)
```

**Seeded accounts** (password `ChangeMe123!`):
- `superadmin@vyntra.com` — platform super admin
- `admin@acme.com` — Acme Corp ORG_ADMIN (Pro plan)
- `editor@acme.com` — Acme Corp editor

---

## 3. TypeScript Rules

- **Strict mode always** — `"strict": true` is set in both `tsconfig.json` files. Never disable it.
- No `any` without a justifying comment. Prefer `unknown` + type narrowing.
- No `// @ts-ignore` or `// @ts-expect-error` without an explanation comment.
- Explicit return types on exported functions and service methods.
- Use `satisfies` operator for Prisma select objects (`satisfies Prisma.UserSelect`).
- Prefer `type` over `interface` for plain data shapes; use `interface` only when extension is the intent.

---

## 4. Next.js 15 App Router Rules

### 4.1 Server vs Client Components

- **Default to Server Components.** Only add `"use client"` when you need:
  - `useState` / `useReducer` / `useEffect` / `useRef`
  - Browser APIs (`window`, `localStorage`, `navigator`)
  - Event handlers (`onClick`, `onChange`, etc.)
  - Third-party client-only libraries
- Never put `"use client"` on a page just because it fetches data — use Server Components for data fetching.
- Keep the client boundary as **deep as possible** — push `"use client"` down to leaf components, not page wrappers.

### 4.2 Data Fetching

- Fetch data in **Server Components** using `async/await` directly — no `useEffect` for initial data.
- For **client-side** fetching (interactive, user-triggered): use `apiFetch()` from `src/lib/api.ts` inside `useEffect` or event handlers.
- Never use `getServerSideProps` or `getStaticProps` — those are Pages Router patterns.
- Use `cache: 'no-store'` for dynamic data, `cache: 'force-cache'` for static.

### 4.3 Routing & File Conventions

```
app/
  (dashboard)/          Route group — shares the dashboard layout
    admin/
      companies/
        page.tsx         → /admin/companies
        [id]/
          page.tsx       → /admin/companies/:id
    layout.tsx           Dashboard shell (sidebar + topbar)
  (auth)/
    login/page.tsx       → /login
  layout.tsx             Root layout (fonts, providers, theme)
  not-found.tsx          Global 404
  error.tsx              Global error boundary
```

- **`page.tsx`** — the route UI. Keep it thin (import + render a View component).
- **`layout.tsx`** — persistent shell. Do not fetch per-request data here unless necessary.
- **`loading.tsx`** — automatic Suspense boundary. Add for routes with async data.
- **`error.tsx`** — must be `"use client"`. Catches render errors in a segment.
- **`not-found.tsx`** — call `notFound()` from `next/navigation` to trigger it.
- Dynamic segment params in Next 15 are `Promise<{ id: string }>` — always `await params`.

### 4.4 Dynamic Routes — Correct Pattern

```tsx
// ✅ Next.js 15 — params is a Promise
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MyView itemId={id} />;
}
```

### 4.5 Metadata

- Export `metadata` or `generateMetadata` from every `page.tsx`.
- Minimum: `title` and `description`.
- For dynamic pages use `generateMetadata`:

```tsx
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Company ${id}` };
}
```

### 4.6 Images

- Always use `next/image` (`<Image>`), never `<img>` — except inside client components where the image `src` is a base64 data URL (e.g. logo preview) where `<img>` is acceptable and intentional. Add `{/* eslint-disable-next-line @next/next/no-img-element */}` on the line before.
- Always provide `width`, `height` or `fill` + `sizes`.
- Remote images: add the domain to `next.config.ts` `images.remotePatterns`.

### 4.7 Links & Navigation

- Use `<Link>` from `next/link` for internal navigation — never `<a href>`.
- Use `useRouter()` from `next/navigation` for programmatic navigation in client components.
- Prefetch is on by default — only disable with `prefetch={false}` if the destination is heavy or rarely visited.

### 4.8 Fonts

- Load fonts in the root `layout.tsx` using `next/font`.
- Pass font class names via `className` to `<html>` — do not use CSS `@import`.

### 4.9 Environment Variables

- `NEXT_PUBLIC_*` — exposed to the browser; keep to a minimum.
- Server-only vars — never prefix with `NEXT_PUBLIC_`.
- Access in Server Components directly via `process.env.VAR`.
- Access in Client Components: only `NEXT_PUBLIC_*` vars.
- Never hardcode secrets anywhere; use `.env.local` (gitignored).

### 4.10 Performance Rules

- Use `React.Suspense` boundaries around slow client components.
- Avoid large client bundles — check with `pnpm build` and inspect output sizes.
- Do not import server-only libraries into client components.
- Use `dynamic(() => import('...'), { ssr: false })` for client-only heavy components (e.g. rich-text editor).

---

## 5. React Rules

- **No class components** — function components only.
- **No prop-drilling beyond 2 levels** — use Context or a dedicated state store (Zustand is available).
- Memoisation: use `useMemo` / `useCallback` only when you can measure a performance problem. Do not add them speculatively.
- Avoid `useEffect` for derived state — compute it inline or with `useMemo`.
- Keys in lists: use stable IDs (e.g. `item.id`), never array index unless the list is static and never reorders.
- Component naming: PascalCase. File names match the component name.
- One component per file for anything non-trivial. Small helper components (< 30 lines) can live at the bottom of the file that uses them.

---

## 6. Styling Rules (Tailwind CSS)

- **Tailwind classes only** — no CSS modules, no styled-components, no inline `style={}` except dynamic values that can't be expressed as utilities (e.g. `style={{ backgroundColor: form.primaryColor }}`).
- Use semantic design-token classes: `bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, `text-foreground`, `text-error`, `bg-success`, etc. See `tailwind.config.ts` for the full list.
- Dark mode via `next-themes` + semantic tokens — they flip automatically. Never write raw `dark:bg-gray-900` for semantic colours.
- Use `cn()` from `src/lib/utils.ts` for conditional class merging — never string interpolation.
- **Consistent UI patterns** (do not deviate without a design reason):
  - Form inputs: `adminInput` class from `AdminGuard.tsx`
  - Cards: `rounded-xl border border-border bg-card p-5`
  - Table wrapper: `overflow-hidden rounded-xl border border-border bg-card`
  - Table header: `bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground`
  - Buttons (primary): `rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background hover:opacity-90 transition cursor-pointer`
  - Buttons (outline): `rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition cursor-pointer`

---

## 7. Forms & Validation Rules

- **Touch-based errors**: show field errors on `blur`, not on every keystroke.
- **Force-reveal on submit/continue**: if user tries to advance, expose all blocking-step errors at once.
- **Never disable the submit/continue button silently** — allow the click and show inline errors.
- Required fields: label includes `<span className="ml-0.5 text-error">*</span>`.
- Error display: `<AlertCircle className="h-3 w-3" />` + message in `text-xs text-error` below the field.
- Error border: add `border-error focus:border-error focus:ring-error/20` on the input.
- Validation patterns:
  - Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())`
  - URL: `new URL(v)` — must have `http:` or `https:` protocol
  - Phone: mask on input (`maskPhone()` pattern from `AddCompanyModal.tsx`)
  - Password: min 8 chars + 4-segment strength bar (Weak / Fair / Good / Strong)

---

## 8. Component Architecture Rules

- **Super-admin views**: `export function XxxAdminView() { return <AdminGuard><Inner /></AdminGuard>; }`
- **Detail pages**: thin `page.tsx` → `XxxDetailView({ xyzId })` → `<AdminGuard><Inner /></AdminGuard>`
- **Modals**: always use the shared `<Modal>` component — never `<dialog>` or custom overlay divs.
- **Tables**: standard wrapper + `<table>`. Empty state in `<td colSpan={n}>` with centered icon + text.
- **Toasts**: `useToaster` + `<Toaster>` from `src/components/common/Toaster.tsx`. Always toast on success AND error.
- **File uploads**: convert to base64 data URL via `FileReader` (API accepts up to 50 MB). No S3/multer.
- **Navigation**: `SUPER_ADMIN_NAV` for super-admins; `NAV_SECTIONS` filtered by `hasModule()` for org users. Both in `src/constants/navigation.ts`.

---

## 9. API Client Rules (`src/lib/api.ts`)

- **All HTTP calls go through `apiFetch()`** — never raw `fetch()` in components.
- Add types and endpoint functions to `api.ts` **before** wiring them in views.
- Type naming:
  - Super-admin shapes: `Admin` prefix (e.g. `AdminCompany`, `AdminPackage`)
  - Tenant-scoped shapes: domain prefix (e.g. `CmsPageData`, `CrmContact`)
- The `admin` object groups all super-admin endpoints. The `orgDomain` object groups domain endpoints.

---

## 10. Backend Rules (NestJS / Prisma)

### Controllers
- Super-admin routes: `@SuperAdminOnly()` + path prefix `admin/`.
- Tenant routes: `@CurrentOrg()` decorator for `organizationId` — **never** read it from `@Body()`.
- One controller per domain. Super-admin variants in `admin-*.controller.ts`.

### DTOs & Validation
- Every `@Body()` has a DTO with `class-validator` decorators.
- Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` — unknown fields are stripped.
- `@IsOptional()` before every optional field decorator.
- Passwords: `@MinLength(8)`. Never log or return them.

### Services & Transactions
- All business logic in services, not controllers.
- Multi-table writes **must** use `prisma.$transaction()`.
- `findOne` throws `NotFoundException` when record is missing.

### Prisma
- **Never `prisma db push`** in dev — always `prisma migrate dev` or a manual migration SQL file. `db push` creates untracked drift.
- After every schema change: `npx prisma generate`.
- Migration naming: descriptive snake_case (e.g. `add_company_profile_fields`).
- If a migration is recorded started-but-unfinished: `npx prisma migrate resolve --applied <name>`.
- `SAFE_SELECT` pattern: define a `Prisma.UserSelect` constant, reuse it. Never return `password`.

### Auth & Security
- bcrypt via `bcryptjs` (not native `bcrypt`) — Windows team member compatibility.
- Salt rounds from `BCRYPT_SALT_ROUNDS` env, default 10.
- CORS origins from `CORS_ORIGINS` env (comma-separated).

---

## 11. Git Rules

- **Never commit directly to `main`**.
- Branch naming: `feat/<topic>`, `fix/<topic>`, `chore/<topic>`.
- Never use `git add -A` or `git add .` — stage specific files to avoid accidentally committing `.env`.
- Never skip hooks (`--no-verify`) without explicit user approval.
- Commit messages: imperative mood, concise, describe the WHY not the WHAT.

---

## 12. What We NEVER Do

| ❌ Never | ✅ Instead |
|---|---|
| `npm install` / `yarn add` | `pnpm add` |
| Raw `fetch()` in a component | `apiFetch()` from `api.ts` |
| `prisma db push` in dev | `prisma migrate dev` or manual SQL migration |
| `eslint-disable` without reason | Fix the actual issue |
| `any` type without comment | Narrow properly or use `unknown` |
| Commit `.env` files | `.env.local` (gitignored) |
| New toast or modal library | Existing `useToaster` / `<Modal>` |
| Read `orgId` from request body | `@CurrentOrg()` decorator |
| Rename `Organization` Prisma model | Keep DB stable; rename UI layer only |
| Multi-paragraph comment blocks | One line max, only when WHY is non-obvious |
| `console.log` in production | `NestJS Logger` on API side |
| `<img>` for internal images | `next/image` (`<Image>`) |
| `<a href>` for internal links | `next/link` (`<Link>`) |
| `getServerSideProps` / `getStaticProps` | App Router Server Components |
| Array index as React key on dynamic lists | Stable `item.id` |
| Commit directly to `main` | Branch + PR |

---

## 13. Adding a New Feature — Checklist

- [ ] Read only the files directly relevant to the task; ask before expanding scope
- [ ] **Backend**: DTO → Service (transaction if multi-table) → Controller (correct guard) → `api.ts` types + endpoint
- [ ] **Frontend**: `api.ts` types first → view in `src/modules/<domain>/` → thin `page.tsx` → navigation update if needed
- [ ] **DB change**: SQL migration file → `prisma migrate deploy` → `prisma generate`
- [ ] Toast on every user-initiated success and error
- [ ] Touch-based validation + inline error messages on all forms
- [ ] `tsc --noEmit` exits 0 on both `apps/web` and `apps/api`
- [ ] No new `any` types introduced

---

## 14. Key File Locations

| File | Purpose |
|---|---|
| `apps/web/src/lib/api.ts` | All frontend ↔ API calls |
| `apps/web/src/constants/navigation.ts` | Sidebar nav (user + super-admin) |
| `apps/web/src/modules/admin/AdminGuard.tsx` | Super-admin gate + `adminInput` CSS class |
| `apps/web/src/components/common/Modal.tsx` | Shared modal — use this, never `<dialog>` |
| `apps/web/src/components/common/Toaster.tsx` | Toast system + `useToaster` hook |
| `apps/web/src/components/ui/StatusBadge.tsx` | Status badges + variant helpers |
| `apps/web/src/components/ui/PageHeader.tsx` | Page titles with optional breadcrumbs |
| `apps/web/src/lib/utils.ts` | `cn()` class merger |
| `apps/api/src/organizations/organizations.service.ts` | Core multi-tenant org service |
| `apps/api/src/common/decorators/` | `@SuperAdminOnly()`, `@CurrentOrg()`, `@RequireModule()` |
| `apps/api/prisma/schema.prisma` | Single source of truth for the data model |