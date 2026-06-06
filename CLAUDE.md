<<<<<<< Updated upstream
# Project: [ERV]

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
- [Rule 2]
- [Rule 3]

## Rules
- ALWAYS run tests after changes
- ALWAYS use TypeScript strict mode
- NEVER commit directly to main
- Keep files under 300 lines — split if larger

## Read and follow
- Do not expand scope beyond the files explicitly mentioned.
- Ask for approval before inspecting additional files.
- Follow same Table structure added before.
- Use reusable component as possible.
=======
# Vyntra — CLAUDE.md

> **This file is loaded into every Claude Code session automatically.**  
> It defines the rules, conventions, and constraints that govern all work on this
> codebase — for every team member and every AI assistant.  
> **Always follow these rules. Do not ask for confirmation before applying them.**

---

## 1. Project Overview

Vyntra is a **multi-tenant SaaS platform** (CMS + CRM + more).

| Layer | Technology | Location |
|---|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3 | `apps/web/src/` |
| Backend | NestJS 10, Prisma ORM, PostgreSQL 16 | `apps/api/src/` |
| Shared types | `@vyntra/types` (must be built before API) | `libs/types/` |
| Package manager | **pnpm only** — never npm or yarn | root `pnpm-lock.yaml` |

---

## 2. How to Run

```bash
# Start everything
pnpm dev           # runs all workspace packages in parallel

# Individually
pnpm dev:web       # Next.js frontend  → http://localhost:3000
pnpm dev:api       # NestJS API        → http://localhost:3001/api

# Database (no Docker on this Mac — uses Homebrew Postgres 16)
# role: vyntra / vyntra_dev_password  db: vyntra_db
pnpm db:migrate    # run pending migrations
pnpm db:seed       # seed test data
pnpm db:studio     # Prisma Studio UI
pnpm build:types   # must run before building/starting API
```

**Seeded test accounts** (password `ChangeMe123!`):
- `superadmin@vyntra.com` — platform super admin
- `admin@acme.com` — Acme Corp ORG_ADMIN (Pro plan)
- `editor@acme.com` — Acme Corp editor

---

## 3. Architecture Rules

### 3.1 Monorepo

- **pnpm only** — never create `package-lock.json` or `yarn.lock`.
- Shared code belongs in `libs/types`. Run `pnpm build:types` whenever types change.
- The root `tsconfig.json` only checks the frontend (`apps/web`). The API has its own.

### 3.2 Multi-tenancy

- Every data model is org-scoped via `organizationId`. **Never** return data from a different org.
- The Prisma model is `Organization` / table `organizations` — this is intentional and must not be renamed (the DB entity stays; only the super-admin UI surface says "Company").
- Super-admin routes start with `/api/admin/`. They are guarded by `@SuperAdminOnly()` and the `User.superAdmin` flag.
- Tenant-facing routes for the current org use `@CurrentOrg()` decorator; never accept an `orgId` from request body.

### 3.3 Auth

- JWT (access + refresh) stored in `localStorage` on the frontend.
- Guard order (global): `JwtAuthGuard → RolesGuard → ModuleAccessGuard`
- Opt out with `@Public()` on a route.
- Roles: `SUPER_ADMIN | ORG_ADMIN | EDITOR | USER | VIEWER`
- Module gating: `@RequireModule('CMS')` etc. Super admins bypass all module checks.

### 3.4 Packages → Modules entitlement

`Package` grants `Module`s via `PackageModule`. An org gets one package via `Subscription`.
`ModuleAccessGuard` + `@RequireModule()` gate feature endpoints.  
`GET /api/organizations/me` returns the resolved `modules: string[]` for the org.

---

## 4. Frontend Rules

### 4.1 File & Folder Conventions

```
apps/web/src/
  app/(dashboard)/         Next.js App Router pages (route segments)
  components/
    common/                Shared presentational (Modal, Toaster, …)
    ui/                    Design-system atoms (PageHeader, StatusBadge, …)
    layout/                AppSidebar, TopBar, etc.
  modules/                 Feature modules — one folder per domain
    admin/                 Super-admin views (Companies, Packages, …)
    cms/                   CMS feature views
    crm/                   CRM feature views (mock data; not yet wired)
  lib/
    api.ts                 Thin HTTP client — all API calls go here
    utils.ts               `cn()` and other pure utils
  constants/
    navigation.ts          NAV_SECTIONS + SUPER_ADMIN_NAV
  providers/               React context providers (Auth, Settings, …)
  hooks/                   Custom React hooks
```

### 4.2 Styling

- **Tailwind CSS only** — no inline `style={}` except for dynamic values (e.g. `style={{ backgroundColor: color }}`).
- Use CSS custom property tokens: `bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, `text-error`, `bg-success`, etc. See `tailwind.config.ts` for the full token set.
- Dark mode is via `next-themes`. Use semantic token classes (they flip automatically); never use raw `dark:` variants for semantic colors.
- Consistent spacing: form inputs use `adminInput` from `AdminGuard.tsx`. Cards use `rounded-xl border border-border bg-card`. Table headers use `bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground`.

### 4.3 Forms & Validation

- **Touch-based validation**: show errors per field on blur, not on every keystroke.
- **Force-reveal on submit/continue**: if the user tries to advance with errors, reveal all blocking fields at once.
- **Never disable Continue/Submit without explaining why** — allow the click, then show inline errors.
- Required fields: always mark with `<span className="ml-0.5 text-error">*</span>`.
- Error messages render below the field with `<AlertCircle>` icon and `text-xs text-error`.
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())`
- URL: `new URL(v)` guard — require `http:` or `https:` protocol.
- Phone: mask input as user types (strip non-digits/+, format with spaces). Use `maskPhone()` from `AddCompanyModal.tsx` as the pattern.
- Password: min 8 chars + show a 4-segment strength bar (Weak/Fair/Good/Strong).

### 4.4 API Client (`src/lib/api.ts`)

- **All API calls go through `apiFetch()`** — never use raw `fetch()` in components.
- Add new shapes and endpoint functions to `api.ts` before wiring them in views.
- Types for super-admin entities: prefix with `Admin` (e.g. `AdminCompany`, `AdminPackage`).
- Types for tenant-scoped entities: use domain prefix (e.g. `CmsPageData`).

### 4.5 Toasts / Notifications

- Use the project's `useToaster` + `<Toaster>` (from `src/components/common/Toaster.tsx`).
- Always show a toast on success AND on error for user-initiated actions.
- Types: `"success" | "error" | "info" | "warning"`.
- Do **not** install `sonner`, `react-hot-toast`, or any other toast library.

### 4.6 Navigation

- Regular users: `NAV_SECTIONS` filtered by `hasModule()`.
- Super admins: `SUPER_ADMIN_NAV` (no module gating).
- Both are in `src/constants/navigation.ts`.

### 4.7 Component Patterns

- Super-admin views: export a `XxxAdminView` component that wraps `<AdminGuard>` around `<Inner>`.
- Detail pages: accept `xyzId: string` prop; fetch in an `Inner` component; guard with `<AdminGuard>`.
- Modals: use the shared `<Modal>` component — never create raw `<dialog>` or custom overlay.
- Tables: use `<table>` with the standard `rounded-xl border border-border bg-card` wrapper.
- Empty states: centered icon + text inside the table `<td colSpan={n}>`.

---

## 5. Backend Rules (NestJS / Prisma)

### 5.1 Controllers

- Super-admin routes: use `@SuperAdminOnly()` decorator, prefix path with `admin/`.
- Tenant routes: use `@CurrentOrg()` to get `organizationId` — **never** read it from `@Body()`.
- One controller per domain module. Super-admin sub-routes can be in a separate `admin-*.controller.ts`.

### 5.2 DTOs & Validation

- Every request body must have a DTO with `class-validator` decorators.
- `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` is global — all unknown fields are stripped.
- Optional fields: always `@IsOptional()` + the type decorator.
- Passwords: `@MinLength(8)` minimum. Never log or return raw passwords.

### 5.3 Services & Transactions

- Business logic lives in services, not controllers.
- Any operation that writes to multiple tables **must** use `prisma.$transaction()`.
- Example: `OrganizationsService.create` creates company + subscription + first admin user atomically.
- `findOne` in admin services should throw `NotFoundException` when the record is missing.

### 5.4 Prisma

- Schema file: `apps/api/prisma/schema.prisma`.
- **Never use `db push` in dev** — always use `prisma migrate dev` or create a manual migration SQL file. `db push` creates drift.
- Migrations go in `apps/api/prisma/migrations/`. Name them descriptively (e.g. `add_company_profile_fields`).
- If a migration records as started-but-unfinished due to past `db push`: `npx prisma migrate resolve --applied <migration_name>`.
- Always run `npx prisma generate` after schema changes.
- `SAFE_SELECT` pattern: never return password hashes. Define a `Prisma.UserSelect` constant and reuse it.

### 5.5 Auth & Security

- Passwords: bcrypt via `bcryptjs` (not native `bcrypt`) for Windows compatibility.
- Salt rounds from env `BCRYPT_SALT_ROUNDS`, default 10.
- Never expose `password` field in any API response.
- CORS origins set via `CORS_ORIGINS` env var (comma-separated).

---

## 6. What We NEVER Do

| ❌ Never | ✅ Instead |
|---|---|
| `npm install` or `yarn add` | `pnpm add` |
| Raw `fetch()` in a component | `apiFetch()` from `api.ts` |
| `prisma db push` in development | `prisma migrate dev` or manual migration |
| Disable the linter (`eslint-disable`) | Fix the actual issue |
| Add `any` types without a comment | Narrow the type properly |
| Commit `.env` files | Keep secrets in `.env.local` (gitignored) |
| Create a new toast/modal library | Use existing `useToaster` / `<Modal>` |
| Call `@CurrentOrg()` data from request body | Use the `@CurrentOrg()` decorator |
| Rename the `organizations` Prisma model/table | Keep DB stable; rename only the UI layer |
| Write multi-paragraph JSDoc / comment blocks | One short comment only when the WHY is non-obvious |
| Add `console.log` to production code | Use NestJS `Logger` on the API side |
| `git add -A` or `git add .` blindly | Stage specific files to avoid leaking secrets |

---

## 7. Adding a New Feature — Checklist

- [ ] **Backend**: DTO with validators → Service (use transaction if multi-table) → Controller (correct guard) → add to `api.ts` types and endpoint functions
- [ ] **Frontend**: update `api.ts` types first → build view in `src/modules/<domain>/` → add page in `src/app/(dashboard)/` → update navigation if needed
- [ ] **DB change**: write migration SQL → `prisma migrate deploy` → `prisma generate`
- [ ] Toasts on every user-initiated success and error
- [ ] Touch-based form validation with inline error messages
- [ ] `tsc --noEmit` passes on both API and web before committing

---

## 8. Key File Locations (Quick Reference)

| File | Purpose |
|---|---|
| `apps/web/src/lib/api.ts` | All frontend ↔ API communication |
| `apps/web/src/constants/navigation.ts` | Sidebar nav (user + super-admin) |
| `apps/web/src/modules/admin/AdminGuard.tsx` | Super-admin gate + `adminInput` CSS class |
| `apps/web/src/components/common/Modal.tsx` | Shared modal component |
| `apps/web/src/components/common/Toaster.tsx` | Toast system + `useToaster` hook |
| `apps/web/src/components/ui/StatusBadge.tsx` | Status badges + variant helpers |
| `apps/web/src/components/ui/PageHeader.tsx` | Page titles with breadcrumbs |
| `apps/api/src/organizations/organizations.service.ts` | Core multi-tenant org service |
| `apps/api/src/common/decorators/` | `@SuperAdminOnly()`, `@CurrentOrg()`, `@RequireModule()` |
| `apps/api/prisma/schema.prisma` | Single source of truth for the data model |
>>>>>>> Stashed changes
