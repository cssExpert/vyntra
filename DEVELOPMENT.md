# Vyntra — Developer Setup (Windows & macOS)

This guide gets the **backend (NestJS API)**, **database (PostgreSQL)**, and **frontend (Next.js)** running locally. It works identically on Windows and macOS.

> The whole repo is a **pnpm monorepo**. Use `pnpm` for everything — not `npm`/`yarn`. Mixing package managers will corrupt the lockfile.

---

## 1. Prerequisites (every teammate, both OSes)

| Tool | Version | Install |
| --- | --- | --- |
| **Node.js** | ≥ 20 LTS | macOS: `nvm install 20` · Windows: [nvm-windows](https://github.com/coreybutler/nvm-windows) or [Volta](https://volta.sh) |
| **pnpm** | ≥ 9 | `npm i -g pnpm@9` (or `corepack enable`) |
| **Docker Desktop** | latest | https://www.docker.com/products/docker-desktop/ — **this is how everyone runs the database** |

Verify:

```bash
node -v      # v20+ 
pnpm -v      # 9+
docker -v    # any recent
```

---

## 2. One-time setup

```bash
# 1. Install all workspace dependencies
pnpm install

# 2. Build the shared types package (consumed by API + web)
pnpm build:types

# 3. Start the database (and Redis/MinIO/Meilisearch) — same on Win/Mac/Linux
pnpm db:up           # docker compose up -d

# 4. Create the API env file
#    macOS/Linux:
cp apps/api/.env.example apps/api/.env
#    Windows (PowerShell):
#    Copy-Item apps/api/.env.example apps/api/.env

# 5. Run migrations + seed sample data
pnpm db:migrate      # applies Prisma migrations
pnpm db:seed         # creates super admin, packages, sample company
```

---

## 3. Run it

```bash
pnpm dev:api         # API → http://localhost:3001/api
pnpm dev:web         # Web → http://localhost:3000
# or both:  pnpm dev
```

Health check:

```bash
curl http://localhost:3001/api/health     # {"status":"ok",...}
```

---

## 4. Seeded accounts (password: `ChangeMe123!`)

| Role | Email | Notes |
| --- | --- | --- |
| **Super Admin** | `superadmin@vyntra.com` | Manages all orgs, users, packages, modules |
| **Org Admin** | `admin@acme.com` | Admin of "Acme Corp" (Pro plan: CMS + CRM) |
| **Editor** | `editor@acme.com` | Editor in Acme Corp |

Quick login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@vyntra.com","password":"ChangeMe123!"}'
```

Send the returned `accessToken` as `Authorization: Bearer <token>` on protected routes.

---

## 5. Architecture (foundation)

- **Multi-tenant**: every business record is scoped to an `organizationId` (a tenant = a company). Users only see their own org's data; super admins see everything.
- **Auth**: self-hosted JWT (access + refresh) signed by the API, password hashing via `bcryptjs`. No third-party auth service.
- **RBAC**: platform `superAdmin` flag + org roles (`ORG_ADMIN`, `EDITOR`, `USER`, `VIEWER`). Enforced by global guards (`JwtAuthGuard → RolesGuard → ModuleAccessGuard`).
- **Packages → Modules**: a **Package** (plan) grants a set of **Modules** (`CMS`, `CRM`, …). A company is assigned a package via a **Subscription**. The `ModuleAccessGuard` + `@RequireModule()` gate feature endpoints, so a company can only use the modules its plan includes. `GET /api/organizations/me` returns the resolved `modules: []` for the frontend to gate navigation.
- **Audit log**: every authenticated mutating request (POST/PUT/PATCH/DELETE) is recorded.

### Key endpoints

```
Public:        POST /api/auth/register | /auth/login | /auth/refresh
               GET  /api/health | /api/packages
Authenticated: GET  /api/auth/me | /api/organizations/me
               GET/PUT /api/users/me
Org admin:     CRUD /api/users  (+ PUT /api/users/:id/role)
Super admin:   CRUD /api/admin/organizations  (+ PUT .../:id/package)
               CRUD /api/admin/packages | /api/admin/modules
               GET  /api/admin/users  (+ PUT /api/admin/users/:id/promote)
```

---

## 6. Cross-platform notes

- **Line endings**: `.gitattributes` forces LF in the repo. Do **not** disable this — it prevents CRLF corruption between Windows and Mac.
- **bcryptjs** (pure JS) is used instead of native `bcrypt`, so there's **no build-toolchain requirement** on Windows.
- All scripts are shell-agnostic and run through pnpm; there are no bash-only build steps.
- Node/pnpm versions are pinned in root `package.json` (`engines`).

---

## 7. Common commands

```bash
pnpm db:up / db:down       # start / stop docker services
pnpm db:migrate            # create & apply a new migration (dev)
pnpm db:seed               # re-seed (idempotent)
pnpm db:studio             # Prisma Studio (browse the DB)
pnpm build                 # build all packages
pnpm type-check            # type-check all packages
```

---

## 8. Troubleshooting

- **`prisma migrate` → "permission denied to create database"**: the DB role needs `CREATEDB` for Prisma's shadow database. With the Docker setup the `vyntra` superuser already has it. (For a manually-installed local Postgres: `ALTER ROLE vyntra CREATEDB;`.)
- **`@vyntra/types` not found / stale types**: run `pnpm build:types`.
- **Port already in use**: API is `3001`, web is `3000`, Postgres is `5432`. Stop conflicting services or change `PORT`/`DATABASE_URL` in `apps/api/.env`.
- **macOS without Docker (fallback only)**: you can use a Homebrew Postgres (`brew install postgresql@16 && brew services start postgresql@16`) and point `DATABASE_URL` at it. This is a personal fallback — **Docker Compose is the team standard** so Windows and Mac stay identical.
```
