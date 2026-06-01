# Vyntra — Progress Log

## 2026-06-01 — Foundation: multi-tenant auth, packages & super-admin

Built the full SaaS foundation (backend + DB + frontend auth) and the package-driven
module system. CMS/CRM business logic is the next phase.

### Backend (NestJS + Prisma + PostgreSQL)
- **Multi-tenant database** — rewrote the Prisma schema: fixed the broken org↔user
  relation (now one company → many users), org-scoped every table, added RBAC.
- **Auth** — self-hosted JWT (access + refresh) with bcrypt. `register`, `login`,
  `refresh`, `me`. No third-party auth (no Clerk/Auth0). Global guards enforce
  authentication, roles, and module access.
- **Roles** — SUPER_ADMIN (platform), ORG_ADMIN, EDITOR, USER, VIEWER.
- **Packages → Modules entitlement system** — a package (plan) grants a set of
  modules; a company is assigned a package via a subscription. This controls what
  each company can access. 9 modules in the catalog.
- **Super-admin APIs** — full CRUD for Organizations, Packages, Modules, and Users
  (list-all + promote-to-super-admin).
- **Audit logging** — every authenticated change (POST/PUT/PATCH/DELETE) is recorded.
- **Seed** — super admin, two sample companies (Pro + Free), and one account per role.

### Frontend (Next.js) — wired to the live API
- **Real login** — the UI now authenticates against the backend, stores the JWT,
  and restores the session on refresh (replaced the old mock login).
- **Package-driven sidebar** — a company sees only the modules its plan includes.
  Pro shows CMS/CRM/Email/SEO/Reports; Free shows only CMS.
- **Super-admin console** — dedicated platform menu with fully dynamic pages:
  - **Organizations** — list, create, change plan, delete companies.
  - **Packages** — create/edit plans and pick which modules each grants (this drives
    every company's navigation), set price / user cap / visibility.
  - **Modules** — manage the feature catalog (add, enable/disable).
  - **Users** — view all users across orgs, promote to super admin.

### Team / tooling setup
- Standardized the repo on **pnpm** (was a broken half-npm setup); fixed several
  invalid dependency versions and missing config that meant it could never install.
- Installed and configured **PostgreSQL**; documented **Docker Compose** as the team
  DB standard so Windows + Mac developers get an identical setup.
- Cross-platform safeguards: `.gitattributes` (line endings), pinned Node/pnpm,
  pure-JS bcrypt (no native build on Windows).
- Wrote **DEVELOPMENT.md** — full onboarding for new team members.

### Seeded test accounts (password: `ChangeMe123!`)
| Role | Email | Company / Plan |
| --- | --- | --- |
| SUPER_ADMIN | superadmin@vyntra.com | — (platform) |
| ORG_ADMIN | admin@acme.com | Acme Corp · Pro |
| EDITOR | editor@acme.com | Acme Corp · Pro |
| USER | user@acme.com | Acme Corp · Pro |
| VIEWER | viewer@acme.com | Acme Corp · Pro |
| ORG_ADMIN | admin@bloom.com | Bloom Studio · Free |

### Verified working
- Auth (login/register/refresh), RBAC (403s), org isolation, audit logging.
- Module gating end-to-end: Pro vs Free companies see different sidebars; editing a
  package's modules changes what that company sees.
- Super-admin pages read/write live data. Frontend type-check clean; all routes compile.

### Not done yet (next phase)
- CMS & CRM **product** pages still render mock sample data — not yet wired to the API.
- Per-role permission differences are enforced on the API but not yet reflected in the
  product UI (since those screens aren't live yet).
