# Authentication, Session Management & RBAC Architecture

## Overview
EduFlow implements a zero-trust, multi-tenant authentication and Role-Based Access Control (RBAC) architecture using **Supabase Auth**, **@supabase/ssr**, and server-verified profile roles.

Primary Auth Files:
- Admin Authorizer: [`lib/auth/authorizeAdmin.ts`](file:///home/basit/eduflow/lib/auth/authorizeAdmin.ts)
- Role & Config Guards: [`lib/config.ts`](file:///home/basit/eduflow/lib/config.ts)
- Client-Side Role Guard: [`components/role-gate.tsx`](file:///home/basit/eduflow/components/role-gate.tsx)
- Edge Middleware Gate: [`middleware.ts`](file:///home/basit/eduflow/middleware.ts)
- Login Route Handler: [`app/api/auth/login/route.ts`](file:///home/basit/eduflow/app/api/auth/login/route.ts)
- Supabase SSR Clients: [`lib/supabase/server.ts`](file:///home/basit/eduflow/lib/supabase/server.ts) & [`lib/supabase/client.ts`](file:///home/basit/eduflow/lib/supabase/client.ts)

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Role Hierarchy & RBAC Matrix

EduFlow enforces strict boundaries between four tenant personas:

| Role | Permitted Routes | DB Access Scope | School ID Requirement |
| :--- | :--- | :--- | :--- |
| **`super_admin`** | `/super-admin/*`, all portals | Global across all tenants | Not bound to a single school (null or bypass) |
| **`school_admin`** / **`admin`** | `/admin/*`, `/onboarding` | Scoped to caller's `school_id` | Mandatory |
| **`teacher`** | `/teacher/*` | Scoped to classes/students of `school_id` | Mandatory |
| **`parent`** / **`student`** | `/parent/*` | Scoped to linked children records | Mandatory |

> [!IMPORTANT]
> The `student` role is merged into the `parent` role. All requests to `/student/*` are redirected (301) to `/parent`.

---

## 2. Server-Side Administrative Verification (`authorizeAdminCaller`)

To eliminate IDOR (Insecure Direct Object Reference) and client-controlled privilege escalation, all admin actions and routes pass through [`lib/auth/authorizeAdmin.ts`](file:///home/basit/eduflow/lib/auth/authorizeAdmin.ts):

1. **Service-Role Profile Lookup:** Uses a backend Supabase admin client (`SUPABASE_SERVICE_ROLE_KEY`) to fetch `role` and `school_id` from `profiles` without RLS constraints.
2. **Metadata Validation:** Reads role from signed `app_metadata` (never trusting client-writable `user_metadata`).
3. **School Ownership Cross-Check:** Resolves `schools.id` where `schools.admin_email` equals the verified session email.
4. **Automatic Profile Synchronization:** If an authorized admin profile lacks a `school_id`, the system automatically links the matching school ID to the profile.
5. **Effective Output:** Returns `{ isAuthorized: boolean, callerProfile: { role, school_id }, schoolId: string | null }`.

---

## 3. Login Security & Timing Attack Mitigation

The login route handler at [`app/api/auth/login/route.ts`](file:///home/basit/eduflow/app/api/auth/login/route.ts) protects against side-channel timing analysis:
- When checking fallback or demo credentials, passwords are hashed into SHA-256 byte buffers before invoking `crypto.timingSafeEqual(bufA, bufB)`.
- Eliminates character-by-character execution time discrepancies.
- Super Admin demo password bypass has been permanently removed in favor of cryptographically verified credentials and authorized email lists.

---

## 4. Super Admin Security Enclave

Super Admin access to `/super-admin` is guarded by multi-layer verification:
1. **Email Whitelist:** [`lib/config.ts`](file:///home/basit/eduflow/lib/config.ts) checks `isSuperAdminEmail(email)`. The primary authorized super administrator is `basithunyawrr@gmail.com` (configurable via `SUPER_ADMIN_EMAILS` env variable).
2. **Middleware Gate:** [`middleware.ts`](file:///home/basit/eduflow/middleware.ts) immediately rejects non-whitelisted users attempting to load `/super-admin` paths.
3. **Client Gate:** [`components/role-gate.tsx`](file:///home/basit/eduflow/components/role-gate.tsx) validates the active session before rendering UI components. Cookie spoofing is completely ineffective because permissions are checked against the authenticated Supabase session.

---

## 5. Token & Cookie Lifecycle

- Cookies are stored as HTTP-only, secure cookies managed by `@supabase/ssr`.
- Tokens are automatically refreshed on every request handled by [`middleware.ts`](file:///home/basit/eduflow/middleware.ts).
- For background server actions (`app/actions/`), [`lib/supabase/server.ts`](file:///home/basit/eduflow/lib/supabase/server.ts) reads cookies synchronously from Next.js `cookies()` header context.

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/routing|Routing Architecture]]
- [[architecture/database|Database & Schema Models]]
- [[features/multi-tenancy|Multi-Tenancy Isolation]]
- [[features/super-admin|Super Admin & Platform Ownership]]
- [[TRACKER|Project Progress Tracker]]
