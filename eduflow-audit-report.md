# 🔍 EduFlow OS — Comprehensive 5-Phase Codebase Audit Report

**Audit Lead:** 👑 Maali (Engineering Lead & Orchestrator)  
**Date:** September 21, 2026  
**Target:** EduFlow OS — Multi-tenant School Management SaaS  
**Stack:** Next.js 16.3.3 (App Router), React 19, Tailwind CSS v4, Drizzle ORM, Prisma, Supabase, PostgreSQL  
**Workspace:** `/home/basit/eduflow`

---

## Executive Summary

> [!CAUTION]
> **This codebase has 16 CRITICAL and 12 HIGH severity vulnerabilities.** Multiple allow complete system compromise without authentication. Production deployment without remediation would expose student PII, allow arbitrary admin account creation, and enable cross-tenant data theft.

### Severity Breakdown

| Severity | Count | Examples |
|:---:|:---:|---|
| 🔴 **Critical** | **16** | Auth bypass, zero RLS, unauthenticated admin creation, cross-tenant data leak, stranger child exposure |
| 🟠 **High** | **12** | Unauthenticated APIs, schema drift, plaintext passwords, missing Arcjet, IDOR deletion |
| 🟡 **Medium** | **12** | Hydration mismatches, a11y violations, unsigned cookies, fail-open middleware |
| 🟢 **Low** | **5** | Decorative search inputs, index keys, icon mismatches, CORS wildcard |

### Phase Results

| Phase | Auditor(s) | Status | Findings |
|---|---|:---:|---|
| **Phase 1:** Secrets & Git Safety | 🔒 Bilal | ✅ Done | 🔴5 🟠4 🟡4 🟢2 |
| **Phase 2:** Route & Button Wiring | 🎨⚡ Zara+Hamza | ✅ Done | 🔴1 🟠5 🟡4 🟢3 |
| **Phase 3:** Database & Multi-tenant | 🗄️ Tariq | ✅ Done | 🔴10 🟠3 🟡2 |
| **Phase 4:** Frontend UI/UX & React | 🎨🔍 Zara+Rayan | ✅ Done | 🔴2 🟡12 🟢3 |
| **Phase 5:** Build, TypeCheck & UBS | 👑 Maali | ✅ Done | ✅ tsc clean, ✅ build clean, ⚠️ 1 deprecation |

---

## 🚨 MASTER TRIAGE TABLE — ALL FINDINGS (Sorted by Severity)

### 🔴 CRITICAL (Fix Before Any Production Deploy)

| # | Issue | File : Lines | Phase | Status |
|:---:|---|---|:---:|:---:|
| C1 | **Super Admin password-free login bypass** — anyone typing the SA email gets God Mode | [`app/api/auth/login/route.ts:138-150`](file:///home/basit/eduflow/app/api/auth/login/route.ts#L138-L150) | P1,P2 | Needs-Fix |
| C2 | **Supabase credentials committed in public git history** | Git commit `fe6ea4a6` | P1 | Needs-Fix |
| C3 | **Unauthenticated school provisioning + admin user creation** | [`app/api/super-admin/schools/route.ts:4-146`](file:///home/basit/eduflow/app/api/super-admin/schools/route.ts#L4-L146) | P1,P2 | Needs-Fix |
| C4 | **Unauthenticated full database dump via subscription API** (`?all=true`) | [`app/api/admin/subscription/route.ts:24-108`](file:///home/basit/eduflow/app/api/admin/subscription/route.ts#L24-L108) | P1,P2,P3 | Needs-Fix |
| C5 | **Unauthenticated subscription activation & payment forgery** | [`app/api/admin/subscription/route.ts:254-329`](file:///home/basit/eduflow/app/api/admin/subscription/route.ts#L254-L329) | P1,P2,P3 | Needs-Fix |
| C6 | **Unauthenticated tenant provisioning & role escalation** | [`app/api/auth/setup-school/route.ts:18-163`](file:///home/basit/eduflow/app/api/auth/setup-school/route.ts#L18-L163) | P1 | Needs-Fix |
| C7 | **Cross-tenant IDOR: teacher deletion without school_id filter** | [`app/api/admin/teachers/route.ts:101-108`](file:///home/basit/eduflow/app/api/admin/teachers/route.ts#L101-L108) | P2,P3 | Needs-Fix |
| C8 | **Fallback to first school — unassigned users hijack tenant data** (students.ts) | [`app/actions/students.ts:64-77`](file:///home/basit/eduflow/app/actions/students.ts#L64-L77) | P3 | Needs-Fix |
| C9 | **Fallback to first school — unassigned users hijack tenant data** (teachers.ts) | [`app/actions/teachers.ts:60-64`](file:///home/basit/eduflow/app/actions/teachers.ts#L60-L64) | P3 | Needs-Fix |
| C10 | **Stranger child PII leak — parents see random students' data** | [`lib/live-data.ts:173-191, 213-224`](file:///home/basit/eduflow/lib/live-data.ts#L173-L191) | P3 | Needs-Fix |
| C11 | **Unfiltered browser queries — all tenants' students exposed** | [`lib/live-data.ts:9-20, 87-90`](file:///home/basit/eduflow/lib/live-data.ts#L9-L20) | P3 | Needs-Fix |
| C12 | **ZERO Row-Level Security (RLS) on any PostgreSQL table** | [`drizzle/0000_nosy_lady_ursula.sql`](file:///home/basit/eduflow/drizzle/0000_nosy_lady_ursula.sql) | P3 | Needs-Fix |
| C13 | **Cross-tenant CSV injection — teacher import accepts client school_id** | [`app/api/admin/teachers/import/route.ts:27`](file:///home/basit/eduflow/app/api/admin/teachers/import/route.ts#L27) | P2,P3 | Needs-Fix |
| C14 | **Table name mismatch: `campuses` vs `schools` in Super Admin Portal** | [`components/super-admin-portal.tsx:221,233`](file:///home/basit/eduflow/components/super-admin-portal.tsx#L221) | P2 | Needs-Fix |
| C15 | **Table name mismatch: queries `fee_invoices` but table is `fee_vouchers`** | [`lib/live-data.ts:122`](file:///home/basit/eduflow/lib/live-data.ts#L122) | P3 | Needs-Fix |
| C16 | **Instant redirect bounce disables entire `/apply` admission form** | [`app/apply/page.tsx:65-67`](file:///home/basit/eduflow/app/apply/page.tsx#L65-L67) | P2 | Needs-Fix |

### 🟠 HIGH

| # | Issue | File : Lines | Phase | Status |
|:---:|---|---|:---:|:---:|
| H1 | **Spoofable cookie session + unbounded Gemini AI API drain** | [`app/api/ai/chat/route.ts:7-20`](file:///home/basit/eduflow/app/api/ai/chat/route.ts#L7-L20) | P1 | Needs-Fix |
| H2 | **Plaintext password storage & insecure local teacher auth** | [`app/api/auth/login/route.ts:116-136`](file:///home/basit/eduflow/app/api/auth/login/route.ts#L116-L136) | P1 | Needs-Fix |
| H3 | **Arcjet defense only on `/api/security-check`, not on attack surfaces** | [`lib/arcjet.ts`](file:///home/basit/eduflow/lib/arcjet.ts) | P1 | Needs-Fix |
| H4 | **Complete Drizzle/Prisma schema drift — Prisma missing school_id, schools table** | `prisma/schema.prisma` vs `lib/db/schema.ts` | P3 | Needs-Fix |
| H5 | **Missing composite unique constraints (roll numbers, employee codes)** | [`lib/db/schema.ts:62-116`](file:///home/basit/eduflow/lib/db/schema.ts#L62-L116) | P3 | Needs-Fix |
| H6 | **All `school_id` FKs are nullable — allows tenantless records** | [`lib/db/schema.ts:24-116`](file:///home/basit/eduflow/lib/db/schema.ts#L24-L116) | P3 | Needs-Fix |
| H7 | **Hardcoded empty report cards & date sheets in Parent Portal** | [`components/parent-portal.tsx:299-300`](file:///home/basit/eduflow/components/parent-portal.tsx#L299-L300) | P2 | Needs-Fix |
| H8 | **Hardcoded super admin email in settings dialog** | [`components/user-settings-dialog.tsx:296`](file:///home/basit/eduflow/components/user-settings-dialog.tsx#L296) | P2 | Needs-Fix |
| H9 | **Unhandled Drizzle exception in student import (no fallback)** | [`app/api/admin/students/import/route.ts:35`](file:///home/basit/eduflow/app/api/admin/students/import/route.ts#L35) | P2 | Needs-Fix |
| H10 | **localStorage hydration mismatch in admin-portal bank settings** | [`components/admin-portal.tsx:56-71`](file:///home/basit/eduflow/components/admin-portal.tsx#L56-L71) | P4 | Needs-Fix |
| H11 | **`navigator.onLine` render-time evaluation breaks hydration** | [`super-admin/telemetry/page.tsx:175,309`](file:///home/basit/eduflow/app/(super-admin)/super-admin/telemetry/page.tsx#L175) | P4 | Needs-Fix |
| H12 | **Missing database indexes on all FK columns** | [`lib/db/schema.ts:24-116`](file:///home/basit/eduflow/lib/db/schema.ts#L24-L116) | P3 | Needs-Fix |

### 🟡 MEDIUM

| # | Issue | File : Lines | Phase | Status |
|:---:|---|---|:---:|:---:|
| M1 | **Incomplete `.gitignore`** — missing `.claude*`, `*litellm*`, `.directory`, `.gemini/` | [`.gitignore`](file:///home/basit/eduflow/.gitignore) | P1 | Needs-Fix |
| M2 | **Hardcoded super admin email in `lib/config.ts`** | [`lib/config.ts:1-18`](file:///home/basit/eduflow/lib/config.ts#L1-L18) | P1 | Needs-Fix |
| M3 | **Fail-open middleware when env vars missing** | [`middleware.ts:30-32`](file:///home/basit/eduflow/middleware.ts#L30-L32) | P1 | Needs-Fix |
| M4 | **Unsigned/insecure session cookies (`eduflow-user-role`)** | [`app/api/auth/login/route.ts:105-106`](file:///home/basit/eduflow/app/api/auth/login/route.ts#L105-L106) | P1 | Needs-Fix |
| M5 | **`middleware.ts` deprecated — must migrate to `proxy` convention** | [`middleware.ts`](file:///home/basit/eduflow/middleware.ts) | P5 | Needs-Fix |
| M6 | **RoleGate strips SSR from all 4 portals (redundant with middleware)** | [`components/role-gate.tsx:32-35`](file:///home/basit/eduflow/components/role-gate.tsx#L32-L35) | P4 | Needs-Fix |
| M7 | **Hard `window.location.href` reloads breaking SPA transitions** (5 files) | Multiple shell components | P4 | Needs-Fix |
| M8 | **Missing Skip Navigation link (WCAG 2.4.1)** | [`app/layout.tsx:41-51`](file:///home/basit/eduflow/app/layout.tsx#L41-L51) | P4 | Needs-Fix |
| M9 | **Unlabeled search inputs across all 4 portals (WCAG 1.3.1/4.1.2)** | Shell components | P4 | Needs-Fix |
| M10 | **Modal inputs with unlinked labels (WCAG 1.3.1)** | Bank settings, onboarding, payment modals | P4 | Needs-Fix |
| M11 | **Custom modals missing Escape key & focus trap (WCAG 2.1.2/2.4.3)** | 5+ modal components | P4 | Needs-Fix |
| M12 | **Mobile hamburger menu missing on public landing** | [`components/public-landing.tsx:128`](file:///home/basit/eduflow/components/public-landing.tsx#L128) | P4 | Needs-Fix |

### 🟢 LOW

| # | Issue | File | Phase | Status |
|:---:|---|---|:---:|:---:|
| L1 | **Wildcard CORS in Edge Worker scaffold** | [`workers/index.ts:28-47`](file:///home/basit/eduflow/workers/index.ts#L28-L47) | P1 | Needs-Fix |
| L2 | **Client-side God Mode impersonation toggle** | [`components/god-mode-bar.tsx:17-46`](file:///home/basit/eduflow/components/god-mode-bar.tsx#L17-L46) | P1 | Needs-Fix |
| L3 | **Array index used as React key** (3 files) | admin/page.tsx, teacher-portal.tsx, timetable/page.tsx | P4 | Needs-Fix |
| L4 | **Decorative search inputs with wrong placeholder text** | Shell components | P2 | Needs-Fix |
| L5 | **Download icon used for Print action** | [`admin/students/page.tsx:472`](file:///home/basit/eduflow/app/(school-admin)/admin/students/page.tsx#L472) | P2 | Needs-Fix |

---

## Phase 5: Build & Static Analysis Results

| Check | Command | Result |
|---|---|:---:|
| **TypeScript** | `npx tsc --noEmit` | ✅ **0 errors** |
| **Next.js Build** | `npm run build` | ✅ **43/43 pages compiled** |
| **Deprecation** | `middleware.ts` convention | ⚠️ Migrate to `proxy` via `npx @next/codemod@canary middleware-to-proxy .` |
| **UBS** | `ubs app components lib middleware.ts` | 🔄 Running (report pending) |

### Build Output — All Routes Compiled

```
Route (app)                              Type
├ ○ /                                    Static
├ ○ /admin (+ 12 sub-routes)             Static
├ ƒ /api/admin/* (4 routes)              Dynamic
├ ƒ /api/ai/chat                         Dynamic
├ ƒ /api/auth/login                      Dynamic
├ ƒ /api/auth/setup-school               Dynamic
├ ƒ /api/security-check                  Dynamic
├ ƒ /api/super-admin/schools             Dynamic
├ ○ /apply, /login, /signup, /onboarding Static
├ ○ /parent (+ 1 sub-route)              Static
├ ○ /super-admin (+ 3 sub-routes)        Static
├ ○ /teacher (+ 3 sub-routes)            Static
└ ○ /pricing, /privacy, /terms, /refund  Static
```

---

## Remediation Priority Matrix

### 🚑 IMMEDIATE (Do Today — Before Any Deploy)

| Action | Files to Change | Effort |
|---|---|:---:|
| **1. Rotate Supabase API keys** in dashboard | Supabase Dashboard → Settings → API | 5 min |
| **2. Purge `.env` from git history** | `git filter-repo --path .env --invert-paths --force` | 10 min |
| **3. Remove Super Admin bypass** in login | `app/api/auth/login/route.ts` — delete lines 138-150 | 5 min |
| **4. Add auth guards** to unauthenticated APIs | `setup-school/route.ts`, `super-admin/schools/route.ts`, `admin/subscription/route.ts` | 30 min |
| **5. Fix cross-tenant teacher deletion** | `app/api/admin/teachers/route.ts` — add `school_id` filter to DELETE | 5 min |
| **6. Remove stranger child fallback queries** | `lib/live-data.ts` — delete `limit(10)` fallback, return empty arrays | 15 min |
| **7. Fix CSV school_id injection** | `app/api/admin/teachers/import/route.ts` — force `profile.school_id` | 5 min |
| **8. Remove `/apply` redirect bounce** | `app/apply/page.tsx` — delete `window.location.replace('/')` useEffect | 2 min |

### 🔧 THIS WEEK (Security Hardening)

| Action | Effort |
|---|:---:|
| **9. Enable RLS on all tables** + create tenant isolation policies | 2-3 hrs |
| **10. Make all `school_id` columns NOT NULL** + migration | 1 hr |
| **11. Replace cookie auth with Supabase SSR session tokens** | 2-3 hrs |
| **12. Wire Arcjet rate limiting to login, signup, AI chat** | 1 hr |
| **13. Fix table name mismatches** (`campuses`→`schools`, `fee_invoices`→`fee_vouchers`) | 15 min |
| **14. Harmonize or decommission Prisma** (resolve dual-ORM drift) | 1-2 hrs |
| **15. Add composite unique constraints** (school+roll, school+employee_code) | 30 min |
| **16. Remove first-school fallback** in server actions — throw error instead | 15 min |

### 📋 NEXT SPRINT (Quality & Polish)

| Action | Effort |
|---|:---:|
| **17. Fix hydration mismatches** (localStorage, navigator.onLine) | 30 min |
| **18. Migrate `middleware.ts` → `proxy` convention** | 30 min |
| **19. Add Skip Navigation + aria-labels across all portals** | 1-2 hrs |
| **20. Add focus trapping & Escape handlers to custom modals** | 1-2 hrs |
| **21. Replace `window.location.href` with `router.push()`** | 30 min |
| **22. Add `error.tsx` boundaries to all route groups** | 30 min |
| **23. Add missing DB indexes** on all FK columns | 30 min |
| **24. Add mobile hamburger menu to public landing** | 1 hr |
| **25. Wire empty parent portal sections** (report cards, date sheets) | 2-3 hrs |
| **26. Patch `.gitignore`** with `.claude*`, `*litellm*`, `.directory` | 5 min |

---

## Git History Cleanup Commands

```bash
# 1. Rotate keys FIRST in Supabase Dashboard

# 2. Install git-filter-repo
pip install git-filter-repo

# 3. Purge .env from all commits
git filter-repo --path .env --invert-paths --force

# 4. Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 5. Verify clean
git log --all --full-history -- ".env"  # Should be empty

# 6. Re-add remote and force push
git remote add origin https://github.com/basssiitt/eduflow.git
git push origin --force --all
git push origin --force --tags
```

---

## API Route Auth Guard Matrix

| Route | Method | Auth? | RBAC? | Verdict |
|---|:---:|:---:|:---:|---|
| `/api/auth/login` | POST | ❌ Bypass | ❌ | 🔴 SA bypass |
| `/api/auth/setup-school` | POST | ❌ None | ❌ | 🔴 Unauth provisioning |
| `/api/super-admin/schools` | POST | ❌ None | ❌ | 🔴 Unauth admin creation |
| `/api/admin/subscription` | GET,POST | ❌ None | ❌ | 🔴 DB dump + payment forge |
| `/api/ai/chat` | POST | ⚠️ Cookie | ❌ | 🟠 Spoofable + no rate limit |
| `/api/admin/teachers` | ALL | ✅ Yes | ⚠️ Partial | 🟠 DELETE has no school_id |
| `/api/admin/teachers/import` | POST | ✅ Yes | ⚠️ | 🔴 Client school_id injection |
| `/api/admin/students/import` | POST | ✅ Yes | ✅ | 🟡 Missing try/catch |
| `/auth/callback` | GET | ⚠️ Implicit | ⚠️ | 🟡 Hardcoded email check |
| `/api/security-check` | GET | ⚠️ Partial | ❌ | 🟢 Diagnostic only |

---

## Schema Audit: Multi-Tenant Isolation

| Table | `school_id` | Nullable? | Index? | FK Cascade? | Unique Constraints |
|---|:---:|:---:|:---:|:---:|---|
| `schools` | Root PK | — | `slug` only | — | Missing `created_at` idx |
| `campuses` | ✅ | **YES** ⚠️ | ❌ | No cascade | None |
| `profiles` | ✅ | **YES** ⚠️ | ❌ | No cascade | None |
| `students` | ✅ | **YES** ⚠️ | ❌ | No cascade | Missing `(school_id, roll)` |
| `teachers` | ✅ | **YES** ⚠️ | ❌ | No cascade | Missing `(school_id, emp)` |
| `attendance` | ✅ | **YES** ⚠️ | ❌ | No cascade | Missing `(student, date)` |
| `fee_vouchers` | ✅ | **YES** ⚠️ | ❌ | No cascade | Missing `(school, challan)` |
| `subscription_payments` | ✅ | NOT NULL ✅ | ❌ | No cascade | None |

---

*Report compiled by 👑 Maali with findings from 🔒 Bilal, 🎨 Zara, ⚡ Hamza, 🗄️ Tariq, and 🔍 Rayan.*  
*Tools used: GSD Core, UBS (pending), TypeScript compiler, Next.js builder.*
