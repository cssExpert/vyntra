# Vyntra SaaS Platform — Master Setup & Build Prompt

## Project Overview
Build a **multi-tenant SaaS business operating system** with centralized super admin controls, organization/company management, and role-based access control.

**MVP Scope**: CMS + CRM modules only (other modules planned for Phase 2)
**Architecture**: Multi-tenant with tenant isolation, JWT-based auth, org-scoped data
**Frontend**: Next.js + TypeScript (existing in `/apps/web`)
**Backend**: NestJS + TypeScript (scaffolded in `/apps/api`)
**Database**: PostgreSQL + Prisma ORM

---

## Current Scaffolding (Already Done)

### File Structure
```
vyntra/
├── apps/
│   ├── web/           (Next.js frontend — do not modify)
│   └── api/           (NestJS backend — continue from here)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── auth/
│       │   ├── users/
│       │   ├── health/
│       │   ├── prisma/
│       │   └── [new modules to create]
│       ├── prisma/
│       │   ├── schema.prisma  (CMS + CRM tables defined)
│       │   └── seed.ts        (to be created)
│       ├── .env
│       └── package.json
├── libs/
│   └── types/         (Shared types — to be created)
├── infrastructure/
│   └── docker-compose.yml  (Postgres, Redis, MinIO, Meilisearch)
└── package.json       (pnpm workspace root)
```

### Prisma Schema (Already Defined)
- **CMS**: pages, blogs, comments, media, website_config
- **CRM**: leads, contacts, campaigns, tasks, activities
- **Core**: users, organizations (modified for multi-tenant)

---

## SaaS Architecture Requirements

### Multi-Tenant Model
- **Tenant = Organization** (company/client)
- Each organization has its own users, CMS pages, CRM leads, etc.
- Data isolation: Users can ONLY access their org's data
- Super Admin can view/manage all organizations

### User Roles & Permissions

```typescript
enum UserRole {
  SUPER_ADMIN   // Can manage all organizations, users, billing, settings
  ORG_ADMIN     // Can manage their organization: users, settings
  EDITOR        // Can edit CMS pages/blogs, manage CRM leads/contacts
  USER          // Read-only access to CMS, limited CRM access
  VIEWER        // Read-only access
}

enum Permission {
  // CMS Permissions
  CMS_CREATE_PAGE
  CMS_EDIT_PAGE
  CMS_DELETE_PAGE
  CMS_PUBLISH_PAGE
  CMS_MANAGE_MEDIA
  CMS_MANAGE_COMMENTS

  // CRM Permissions
  CRM_CREATE_LEAD
  CRM_EDIT_LEAD
  CRM_DELETE_LEAD
  CRM_CREATE_CONTACT
  CRM_EDIT_CONTACT
  CRM_MANAGE_CAMPAIGNS
  CRM_MANAGE_TASKS
  CRM_VIEW_ACTIVITIES

  // Admin Permissions
  ADMIN_MANAGE_USERS
  ADMIN_MANAGE_ORGANIZATION
  ADMIN_VIEW_ANALYTICS
  ADMIN_MANAGE_BILLING

  // Super Admin Permissions
  SUPER_ADMIN_MANAGE_ORGANIZATIONS
  SUPER_ADMIN_MANAGE_ALL_USERS
  SUPER_ADMIN_VIEW_ALL_DATA
  SUPER_ADMIN_MANAGE_BILLING
}
```

### Database Schema Updates (Prisma)

**Updated tables** (modify from existing schema):
- `users` — Add `superAdmin` flag, org scoping
- `organizations` — Add billing, subscription status
- `user_roles` — Map users to roles per organization
- `role_permissions` — Define role-permission mappings

**Add new tables**:
- `subscriptions` — Org subscription/billing
- `audit_logs` — Track all actions by users
- `api_keys` — For programmatic access

---

## Your Implementation Tasks (Priority Order)

### Phase 1: Foundation & Multi-Tenant Setup

#### Task 1: Update Prisma Schema for Multi-Tenant & RBAC
**File**: `apps/api/prisma/schema.prisma`

**Changes**:
1. Update `User` model:
   - Add `superAdmin: Boolean @default(false)`
   - Add `organizationId` (nullable for super admin)
   - Add `lastLogin` timestamp
   - Add relation to `UserRole`

2. Update `Organization` model:
   - Add `plan: SubscriptionPlan` (FREE, PRO, ENTERPRISE)
   - Add `maxUsers: Int`
   - Add `isActive: Boolean @default(true)`
   - Add relation to `Subscription`

3. Create new `UserRole` model:
   ```prisma
   model UserRole {
     id    String @id @default(cuid())
     role  Role
     userId String
     organizationId String?
     user  User @relation(fields: [userId], references: [id], onDelete: Cascade)
     organization Organization? @relation(fields: [organizationId], references: [id], onDelete: Cascade)
   }
   
   enum Role {
     SUPER_ADMIN
     ORG_ADMIN
     EDITOR
     USER
     VIEWER
   }
   ```

4. Create `Subscription` model:
   ```prisma
   model Subscription {
     id    String @id @default(cuid())
     plan  SubscriptionPlan
     status SubscriptionStatus @default(ACTIVE)
     billingEmail String?
     organizationId String @unique
     startDate DateTime @default(now())
     endDate DateTime?
     organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
   }
   
   enum SubscriptionPlan {
     FREE
     PRO
     ENTERPRISE
   }
   
   enum SubscriptionStatus {
     ACTIVE
     PAUSED
     CANCELLED
   }
   ```

5. Create `AuditLog` model:
   ```prisma
   model AuditLog {
     id    String @id @default(cuid())
     action String
     userId String
     organizationId String
     resourceType String
     resourceId String
     changes Json?
     createdAt DateTime @default(now())
     user User @relation(fields: [userId], references: [id], onDelete: Cascade)
     organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
   }
   ```

#### Task 2: Create Shared Types Library
**Create**: `libs/types/`

**Files**:
- `package.json` — Export as `@vyntra/types`
- `src/index.ts` — Main exports
- `src/auth.types.ts` — User, UserRole, permissions
- `src/cms.types.ts` — Page, Blog, Comment, Media
- `src/crm.types.ts` — Lead, Contact, Campaign, Task, Activity
- `src/org.types.ts` — Organization, Subscription, Role, Permission
- `tsconfig.json`

**Example** (`src/auth.types.ts`):
```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  EDITOR = 'EDITOR',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  superAdmin: boolean;
  organizationId?: string;
  roles: UserRole[];
  createdAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
```

#### Task 3: Create Auth Module with JWT & Multi-Tenant
**Create**: `apps/api/src/auth/`

**Files**:
- `auth.module.ts` — Import JwtModule, PassportModule
- `auth.service.ts` — login, register, validate token, refresh token
- `auth.controller.ts` — POST `/auth/login`, POST `/auth/register`, POST `/auth/refresh`
- `jwt.strategy.ts` — JWT extraction and payload validation
- `jwt-auth.guard.ts` — Guard to check JWT + extract org context
- `dtos/` — login.dto, register.dto with validation

**Key Features**:
- Hash passwords with bcrypt
- Generate JWT with org context (payload includes userId, organizationId, role)
- Validate org membership on every request
- Support both user login and super admin login

**Example** (`auth.service.ts`):
```typescript
async login(email: string, password: string) {
  const user = await this.prisma.user.findUnique({
    where: { email },
    include: { roles: true, organization: true }
  });

  if (!user || !await bcrypt.compare(password, user.password)) {
    throw new UnauthorizedException('Invalid credentials');
  }

  const token = this.jwtService.sign({
    userId: user.id,
    email: user.email,
    organizationId: user.organizationId,
    superAdmin: user.superAdmin,
    roles: user.roles.map(r => r.role)
  });

  return { user, token };
}
```

#### Task 4: Create Organizations Module (Super Admin)
**Create**: `apps/api/src/organizations/`

**Files**:
- `organizations.module.ts`
- `organizations.service.ts` — CRUD for orgs, plan changes
- `organizations.controller.ts` — endpoints
- `dtos/` — create-org.dto, update-org.dto

**Endpoints** (Super Admin only):
```
GET    /api/admin/organizations        — List all orgs (super admin only)
POST   /api/admin/organizations        — Create new org
GET    /api/admin/organizations/:id    — Get org details
PUT    /api/admin/organizations/:id    — Update org
DELETE /api/admin/organizations/:id    — Delete org

GET    /api/admin/organizations/:id/users — List org users
POST   /api/admin/organizations/:id/users — Add user to org
PUT    /api/admin/organizations/:id/users/:userId — Update user role
DELETE /api/admin/organizations/:id/users/:userId — Remove user

PUT    /api/admin/organizations/:id/subscription — Update subscription plan
GET    /api/organizations/me          — Get current org (org member)
```

#### Task 5: Create Users Module with Multi-Tenant
**Create/Update**: `apps/api/src/users/`

**Files**:
- `users.module.ts`
- `users.service.ts` — CRUD, role assignment, org scoping
- `users.controller.ts` — endpoints
- `dtos/` — create-user.dto, update-user-role.dto

**Endpoints**:
```
GET    /api/users                      — List users in my org
POST   /api/users                      — Create user in my org (ORG_ADMIN only)
GET    /api/users/:id                  — Get user details
PUT    /api/users/:id                  — Update user
DELETE /api/users/:id                  — Remove user from org

PUT    /api/users/:id/role             — Change user role (ORG_ADMIN only)
GET    /api/users/me                   — Get current user profile
PUT    /api/users/me                   — Update my profile

# Super Admin endpoints
GET    /api/admin/users                — List all users across all orgs (super admin)
PUT    /api/admin/users/:id/promote    — Promote user to super admin
```

#### Task 6: Update App Module
**Update**: `apps/api/src/app.module.ts`

Ensure all modules are imported:
```typescript
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'dev-secret' }),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    CmsModule,        // Create next
    CrmModule,        // Create next
  ],
})
export class AppModule {}
```

### Phase 2: CMS & CRM Modules (Org-Scoped)

#### Task 7: Create CMS Module
**Create**: `apps/api/src/cms/`

**Files**:
- `cms.module.ts`
- `cms.service.ts` — Business logic with org scoping
- `pages.controller.ts` — Page CRUD (org-scoped)
- `blogs.controller.ts` — Blog CRUD (org-scoped)
- `media.controller.ts` — File upload/management
- `comments.controller.ts` — Comment moderation
- `config.controller.ts` — Website config per org
- `dtos/` — create-page.dto, update-blog.dto, etc.

**Key Features**:
- All CRUD ops filtered by current org
- Publish/draft workflow
- Comment moderation
- SEO metadata per page

**Example** (`pages.controller.ts`):
```typescript
@Controller('cms/pages')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private cmsService: CmsService) {}

  @Get()
  async getPages(@Request() req) {
    // req.user.organizationId is set by JWT guard
    return this.cmsService.getPages(req.user.organizationId);
  }

  @Post()
  @Roles('ORG_ADMIN', 'EDITOR')
  async createPage(@Request() req, @Body() data: CreatePageDto) {
    return this.cmsService.createPage(req.user.organizationId, data);
  }
}
```

#### Task 8: Create CRM Module
**Create**: `apps/api/src/crm/`

**Files**:
- `crm.module.ts`
- `crm.service.ts` — Business logic with org scoping
- `leads.controller.ts` — Lead CRUD (org-scoped)
- `contacts.controller.ts` — Contact CRUD
- `campaigns.controller.ts` — Campaign management
- `tasks.controller.ts` — Task assignment
- `activities.controller.ts` — Activity logging
- `dtos/` — create-lead.dto, update-contact.dto, etc.

**Endpoints** (all org-scoped):
```
GET    /api/crm/leads
POST   /api/crm/leads
GET    /api/crm/leads/:id
PUT    /api/crm/leads/:id
DELETE /api/crm/leads/:id

[Similar for contacts, campaigns, tasks, activities]
```

### Phase 3: Middleware & Decorators

#### Task 9: Create Request Scoping & Guards
**Create**: `apps/api/src/common/`

**Files**:
- `guards/jwt-auth.guard.ts` — Extract org context from JWT
- `guards/roles.guard.ts` — Check user role/permissions
- `decorators/org.decorator.ts` — @CurrentOrg() to inject org ID
- `decorators/roles.decorator.ts` — @Roles('ORG_ADMIN') for endpoints
- `interceptors/org-scoping.interceptor.ts` — Ensure all queries scoped to org
- `filters/exceptions.filter.ts` — Global error handler

**Example** (`org.decorator.ts`):
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentOrg = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.organizationId;
  }
);
```

#### Task 10: Create Middleware for Audit Logging
**Create**: `apps/api/src/common/middleware/audit-log.middleware.ts`

Log all user actions for compliance and debugging:
```typescript
@Injectable()
export class AuditLogMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function(data) {
      // Log the action after response
      if (req.user) {
        this.prisma.auditLog.create({
          data: {
            action: `${req.method} ${req.path}`,
            userId: req.user.id,
            organizationId: req.user.organizationId,
            resourceType: req.path.split('/')[3],
            statusCode: res.statusCode
          }
        });
      }
      return originalSend.call(this, data);
    };

    next();
  }
}
```

### Phase 4: Database & Seeding

#### Task 11: Create Prisma Migration
```bash
pnpm --filter @vyntra/api prisma generate
pnpm --filter @vyntra/api prisma migrate dev --name init_multi_tenant
```

#### Task 12: Create Seed Script
**Create**: `apps/api/prisma/seed.ts`

Seed sample organizations, users, roles, and CMS/CRM data:
```typescript
async function main() {
  // Create super admin
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@vyntra.com',
      name: 'Super Admin',
      password: await bcrypt.hash('password123', 10),
      superAdmin: true
    }
  });

  // Create org 1
  const org1 = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      email: 'admin@acme.com',
      plan: 'PRO',
      subscription: {
        create: { plan: 'PRO', status: 'ACTIVE' }
      }
    }
  });

  // Create org admin
  const orgAdmin = await prisma.user.create({
    data: {
      email: 'admin@acme.com',
      name: 'Admin',
      password: await bcrypt.hash('password123', 10),
      organizationId: org1.id,
      roles: {
        create: { role: 'ORG_ADMIN', organizationId: org1.id }
      }
    }
  });

  // Create sample pages, leads, etc.
  // ...
}
```

---

## API Overview

### Public Endpoints
```
POST   /api/auth/register          — Create account & org
POST   /api/auth/login             — User login
POST   /api/auth/refresh           — Refresh token
GET    /api/health                 — Health check
```

### Organization Member Endpoints (Authenticated)
```
GET    /api/organizations/me       — Get my org
GET    /api/cms/pages              — List pages (org-scoped)
POST   /api/cms/pages              — Create page
GET    /api/crm/leads              — List leads (org-scoped)
POST   /api/crm/leads              — Create lead
[... more CMS/CRM endpoints]
```

### Organization Admin Endpoints
```
GET    /api/users                  — List users in my org
POST   /api/users                  — Create user
PUT    /api/users/:id/role         — Update user role
[... org management]
```

### Super Admin Endpoints
```
GET    /api/admin/organizations    — List all orgs
POST   /api/admin/organizations    — Create org
GET    /api/admin/users            — List all users
PUT    /api/admin/users/:id/promote — Make super admin
[... super admin controls]
```

---

## Environment Variables
```bash
# .env
DATABASE_URL=postgresql://vyntra:vyntra_dev_password@localhost:5432/vyntra_db
JWT_SECRET=your-super-secret-key-change-in-prod
JWT_EXPIRATION=24h
PORT=3001
CORS_ORIGINS=http://localhost:3000
```

---

## Verification & Testing

After implementation:

```bash
# Install & setup
pnpm install
docker compose -f infrastructure/docker-compose.yml up -d

# Run migrations
pnpm --filter @vyntra/api prisma migrate dev

# Seed data
pnpm --filter @vyntra/api prisma db seed

# Start backend
pnpm dev:api

# Test endpoints
curl http://localhost:3001/api/health

# Register super admin
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@vyntra.com","password":"password123","name":"Super Admin"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@vyntra.com","password":"password123"}'
```

---

## Constraints & Rules

1. **CMS + CRM ONLY** — No Store, Donations, Finance, HR, Events, etc. yet
2. **Multi-Tenant Isolation** — All queries must be scoped to `organizationId`
3. **TypeScript Everywhere** — Every file must have proper types
4. **Role-Based Access** — Guards must enforce role/permission checks
5. **Audit Logging** — Track all admin and CMS/CRM changes
6. **Error Handling** — Consistent error responses with meaningful messages
7. **JWT-Based Auth** — No session cookies; use JWT tokens

---

## Success Criteria

- ✅ Multi-tenant Prisma schema with RBAC (users, orgs, roles)
- ✅ JWT auth with org context
- ✅ Organizations module for super admin (CRUD orgs, manage users)
- ✅ Users module with multi-tenant user management
- ✅ CMS module fully functional (Pages, Blogs, Media, Comments, Config)
- ✅ CRM module fully functional (Leads, Contacts, Campaigns, Tasks, Activities)
- ✅ All endpoints org-scoped (org members only see their data)
- ✅ Super admin can view/manage all orgs
- ✅ Audit logging for compliance
- ✅ Seed script populates sample data
- ✅ Backend starts: `pnpm dev:api`
- ✅ Health endpoint responds: `curl http://localhost:3001/api/health`

---

## Start Here

1. Begin with **Task 1**: Update Prisma schema for multi-tenant + RBAC
2. Run `pnpm install` and Docker Compose services
3. Continue through tasks in order
4. For each task, focus on implementation, not discussion
5. Refer to `/memories/repo/vyntra-tech-stack-plan.md` for context on future modules

**Key Message**: This is a SaaS foundation. Every endpoint, every query, every user action must be scoped to their organization. Super admin is the only exception.

Good luck! 🚀
