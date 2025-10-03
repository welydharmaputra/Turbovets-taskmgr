# To run the front-end and back-end, you need to run "npx nx serve dashboard" and "npx nx serve api" on a different powershells.

## The Architecture overview:

## Architecture Overview

```
turbovets-taskmgr/
├─ apps/
│  ├─ api/                      # NestJS backend application
│  │  ├─ src/
│  │  │  ├─ app/
│  │  │  │  ├─ app.module.ts
│  │  │  │  ├─ entities/        # TypeORM entities: Organization, User, Task
│  │  │  │  ├─ auth/            # Auth (controllers, services, strategies, guards, decorators)
│  │  │  │  ├─ tasks/           # Tasks (controllers, services)
│  │  │  │  └─ seed.ts          # Development seeding (seedDev function)
│  │  │  └─ main.ts
│  └─ dashboard/                # Angular frontend app (NgRx)
│     ├─ src/
│     │  ├─ app/
│     │  │  ├─ app.component.ts # Main shell (standalone)
│     │  │  ├─ app.routes.ts    # Routes ('/login', '/tasks')
│     │  │  ├─ core/
│     │  │  │  ├─ api/          # HttpClient wrappers: AuthApi, TasksApi
│     │  │  │  └─ auth/         # TokenService, jwt.interceptor, auth.guard
│     │  │  ├─ features/
│     │  │  │  ├─ auth/
│     │  │  │  │  └─ login.component.ts
│     │  │  │  └─ tasks/
│     │  │  │     └─ tasks.page.ts
│     │  │  └─ store/           # NgRx: actions, reducers, effects for auth & tasks
│     │  └─ environments/
├─ libs/
│  ├─ auth/                     # (Backend) Re-usable NestJS guards/decorators
│  └─ data/                     # Shared types/enums: Role, TaskStatus, JwtClaims
├─ tools/                       # Custom Nx tools/scripts
├─ nx.json, tsconfig.base.json, package.json, etc. # Root config files
```

**Key Points**
- The monorepo uses Nx to manage both Angular (frontend) and NestJS (backend) apps.
- Shared code (types, enums, utilities) lives in `libs/`.
- The backend (`api/`) is organized by domain (entities, auth, tasks).
- The frontend (`dashboard/`) is organized by feature and uses NgRx for state management.
- All configuration and tooling (Nx, TypeScript, etc.) reside at the root.



## Access control design & data models

### Data model (simplified)

Organization: id, name

User: id, email, passwordHash, role (Owner | Admin | Viewer), organization

Task: id, title, description?, category?, status (todo | in_progress | done),
createdAt, updatedAt, owner: User, organization: Organization

WT & claims

On login, the API issues a JWT with claims:

interface JwtClaims {
  sub: string;       // user id
  email: string;
  orgId: string;
  role: Role;        // OWNER / MANAGER / MEMBER / VIEWER
  iat: number; exp: number;
}


passport-jwt extracts the Bearer token; JwtStrategy.validate() returns JwtClaims,
which becomes req.user.

### Guards & decorators

-  JwtAuthGuard – ensures a valid token is present.

-  @Roles(Role.OWNER, Role.MANAGER) + RbacGuard – declarative role checks.

-  @ReqUser() – decorator to retrieve the JwtClaims from req.user.

### Service-level enforcement

-  Even if a controller forgets a guard, services still enforce tenant & role rules:

-  Every query filters by organization.id = req.user.orgId (multi-tenant isolation).

-  Mutating methods call ensureCanWrite(req.user.role) (e.g. VIEWER is read-only).

-  Updates/removes re-check the resource belongs to the caller’s org before writing.

### Trade-offs & decisions

-  RBAC simplicity vs flexibility: a single role on User is easy to reason about,
but coarse. For finer control, move to permission flags or role-per-resource.

-  Defense in depth: checks happen in both guards and services. Slight duplication,
but safer and easier to test.

-  Multi-tenancy by orgId: simple and efficient. For cross-org features you’ll need
scoped exceptions or sharing rules.

-  JWT (stateless): easy to scale horizontally. Consider refresh tokens/rotation for
longer sessions.



## Sample API requests & responses

Base URL: http://localhost:3000/api

POST /api/auth/login
Content-Type: application/json

{
  "email": "owner@demo.com",
  "password": "Password123!"
}



## Notes on potential future enhancements

### Complete all the error until it's done

### Auth/session

- Refresh tokens with rotation & revoke lists

- Password reset & email verification flows

- SSO (OIDC) provider integration

### RBAC/permissions

- Fine-grained, resource-level permissions (policy engine or attribute-based access)

- Role per project/space instead of global role

### API & data

- Pagination, sorting & filtering at the API layer

- Soft deletes & audit log (current build has an AuditInterceptor)

- WebSocket/SSE for live task updates

### Frontend

- Optimistic updates with rollback on failure

- Better offline handling & background sync

- Component tests + Cypress e2e

### Ops

- Dockerfile + docker-compose (db + api + web)

- CI (lint, typecheck, unit/e2e) with GitHub Actions

- Infra as code & staging environment

- API rate limiting, helmet, CORS hardening
