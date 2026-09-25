# Next.js App Router & Portal Routing Architecture

## Overview & Routing Hierarchy
EduFlow is built on **Next.js 16 (App Router)** with server components, client interactive shells, and route groups isolating the four principal portals. The system enforces zero-trust routing via [`middleware.ts`](file:///home/basit/eduflow/middleware.ts), server action permission gates, and client-side [`role-gate.tsx`](file:///home/basit/eduflow/components/role-gate.tsx).

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Portal Route Groups

EduFlow segregates user experiences into four dedicated route groups inside `app/`:

### 🏫 School Admin Portal (`(school-admin)`)
- **Root Path:** `/admin`
- **Primary Shell:** [`components/school-admin-shell.tsx`](file:///home/basit/eduflow/components/school-admin-shell.tsx) & [`components/admin-portal.tsx`](file:///home/basit/eduflow/components/admin-portal.tsx)
- **Target Role:** `school_admin`, `admin`
- **Sub-routes:**
  - `/admin/overview` & `/admin/dashboard`: Real-time campus KPIs, fee collection, attendance metrics.
  - `/admin/students`: Student directory, enrollment, class assignment.
  - `/admin/teachers`: Staff directory, salaries, workload allocations.
  - `/admin/fees` & `/admin/finance`: Fee voucher creation, 3-part bank challans, expense tracking.
  - `/admin/billing`: Campus SaaS subscription status, plan renewal.
  - `/admin/attendance`: Daily campus attendance logs.
  - `/admin/admissions`: Incoming student applications from the public `/apply` portal.
  - `/admin/timetable`: Class schedules and subject periods.
  - `/admin/exams`: Exam scheduling and term results.
  - `/admin/settings`: School profile, bank account configs, branch metadata.
- **Legacy Redirects:** Requests to `/admin/broadcast` are permanently redirected (301) to `/admin`.
- **Linked Features:** [[features/multi-tenancy]], [[features/finance-billing]], [[features/students]], [[features/teachers]], [[features/attendance]].

### 👨‍🏫 Teacher Portal (`(teacher)`)
- **Root Path:** `/teacher`
- **Primary Shell:** [`components/teacher-shell.tsx`](file:///home/basit/eduflow/components/teacher-shell.tsx) & [`components/teacher-portal.tsx`](file:///home/basit/eduflow/components/teacher-portal.tsx)
- **Target Role:** `teacher`
- **Sub-routes:**
  - `/teacher/classes`: Assigned classes, student rosters.
  - `/teacher/diary`: Homework assignments, announcements, audio notes via [`components/teacher-diary.tsx`](file:///home/basit/eduflow/components/teacher-diary.tsx).
  - `/teacher/gradebook`: Marks entry, exam grades via [`components/teacher-gradebook.tsx`](file:///home/basit/eduflow/components/teacher-gradebook.tsx).
- **Linked Features:** [[features/teachers]], [[features/academic-diary]], [[features/attendance]].

### 👨‍👩‍👧 Parent & Student Portal (`(parent)`)
- **Root Path:** `/parent`
- **Primary Shell:** [`components/parent-shell.tsx`](file:///home/basit/eduflow/components/parent-shell.tsx) & [`components/parent-portal.tsx`](file:///home/basit/eduflow/components/parent-portal.tsx)
- **Target Role:** `parent`, `student`
- **Consolidation Note:** Per system architecture, the Student Portal is unified into the Parent Portal. Any visit to `/student` or `/student/*` is permanently redirected (301) to `/parent`.
- **Sub-routes:**
  - `/parent/children`: Child performance overview, fee challans, daily diary, attendance history.
- **Linked Features:** [[features/students]], [[features/finance-billing]], [[features/academic-diary]].

### 👑 Super Admin Portal (`(super-admin)`)
- **Root Path:** `/super-admin`
- **Primary Shell:** [`components/super-admin-shell.tsx`](file:///home/basit/eduflow/components/super-admin-shell.tsx) & [`components/super-admin-portal.tsx`](file:///home/basit/eduflow/components/super-admin-portal.tsx)
- **Target Role:** `super_admin` (Strictly restricted to platform owners such as `basithunyawrr@gmail.com`).
- **Sub-routes:**
  - `/super-admin/dashboard`: Global tenant count, MRR, active school accounts.
  - `/super-admin/subscriptions`: School billing status, plan overrides, payment approvals.
  - `/super-admin/telemetry`: System health, edge metrics, database load.
- **Linked Features:** [[features/super-admin]], [[architecture/auth]].

---

## 2. Public & Authentication Routes

- `/` (`app/page.tsx`): Main marketing landing page with interactive Pakistani school fee calculator and feature tours.
- `/pricing` (`app/pricing/page.tsx`): Pricing tiers (Starter, Pro, Enterprise) in PKR.
- `/apply` (`app/apply/page.tsx`): Public online admission application form for parents.
- `/login` (`app/login/page.tsx`): Multi-portal login gateway supporting Supabase Auth and Demo Quick-Login.
- `/signup` (`app/signup/page.tsx`): School administrator registration.
- `/onboarding` (`app/onboarding/page.tsx`): New school setup wizard (campus, grade levels, fee structure).
- `/auth/callback` (`app/auth/callback/route.ts`): OAuth exchange handler that routes users to their specific landing page via `ROLE_PORTAL_ROUTES`.
- Legal routes: `/terms`, `/privacy`, `/refund-policy`.

---

## 3. API Route Endpoints (`app/api/`)

| Endpoint | Method | Role Gate | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Constant-time password verification via SHA-256 digest before `timingSafeEqual`. |
| `/api/auth/setup-school` | `POST` | Authenticated | Provisions a new school tenant bound to verified Supabase caller ID. |
| `/api/admin/subscription` | `GET`, `POST` | `school_admin` | Queries or submits school subscription invoices and payment proofs. |
| `/api/admin/students/import` | `POST` | `school_admin` | Parses CSV bulk import for students scoped to caller's `school_id`. |
| `/api/admin/teachers` | `GET`, `POST` | `school_admin` | Manages faculty records with strict multi-tenant filtering. |
| `/api/admin/teachers/import` | `POST` | `school_admin` | Bulk CSV import of faculty with prototype pollution protection. |
| `/api/admissions/apply` | `POST` | Public | Ingests admission applications into the school's queue. |
| `/api/super-admin/schools` | `GET`, `PATCH` | `super_admin` | Platform-level management of tenant schools and subscriptions. |
| `/api/ai/chat` | `POST` | Authenticated | AI assistant endpoint powered by Google GenAI (`@google/genai`). |
| `/api/security-check` | `GET` | Authenticated | System diagnostic check with sanitized error responses. |

---

## 4. Server Actions (`app/actions/`)

- [`app/actions/students.ts`](file:///home/basit/eduflow/app/actions/students.ts):
  - `addStudentAction(formData)`: Validates tenant context, verifies unique roll number, writes to database.
  - `updateStudentAction(formData)`: Updates student details ensuring strict tenant containment.
  - `deleteStudentAction(id)`: Cascading soft/hard delete of student and related records.
- [`app/actions/teachers.ts`](file:///home/basit/eduflow/app/actions/teachers.ts):
  - `addTeacherAction(formData)`: Registers teacher with employee code unique constraint.
  - `updateTeacherAction(formData)`: Updates faculty record.

---

## 5. Middleware Layer (`middleware.ts`)

- **Supabase SSR Synchronization:** Extracts cookies and refreshes session tokens via `@supabase/ssr`.
- **Permanent Redirects:**
  - `/student` -> `/parent` (Status 301)
  - `/admin/broadcast` -> `/admin` (Status 301)
- **Prefix Guarding:** Intercepts unauthenticated visits to `/admin`, `/teacher`, `/parent`, `/super-admin`, and `/onboarding`, redirecting to `/login`.
- **Role Redirection:** Validates target portal against authenticated role via `isSuperAdminEmail` and `normalizeRole`.

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/auth|Authentication & RBAC]]
- [[architecture/database|Database & Schema Models]]
- [[architecture/edge|Edge Workers & Telemetry]]
- [[features/multi-tenancy|Multi-Tenancy Isolation]]
- [[TRACKER|Project Progress Tracker]]
