# Squad Activity & Engineering Changelog

Living audit log tracking all engineering commits, security hardening, schema migrations, and knowledge graph sync events for EduFlow.

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 📅 2026-09-25: Obsidian Vault "EduFlow OS" Knowledge Graph Initialization
- **Lead / Orchestrator:** 👑 Maali
- **Curator:** 📝 Zubair (Docs & Roadmap Curator)
- **Action:** Bootstrapped interactive, bidirectional Obsidian knowledge graph inside `EduFlow OS`.
- **Created Nodes:**
  - `[[INDEX]]`: Master central hub connecting all nodes.
  - `[[TRACKER]]`: Living status tracker for Completed, In Progress, and Next Plans.
  - `[[architecture/routing]]`: App Router route groups, portal hierarchy, 301 redirects.
  - `[[architecture/database]]`: Drizzle ORM schema, models, composite constraints, RLS policies.
  - `[[architecture/auth]]`: Supabase Auth, session handling, `authorizeAdminCaller`, RBAC matrix.
  - `[[architecture/edge]]`: Cloudflare Workers scaffold, `/edge/health`, `/edge/sync-ping`.
  - `[[features/multi-tenancy]]`: `school_id` tenant isolation, cascading rules, onboarding flow.
  - `[[features/finance-billing]]`: 3-part bank challans, Kuickpay/1Link readiness, SaaS tiers.
  - `[[features/students]]`: Student directory, bulk CSV import, public `/apply` pipeline.
  - `[[features/teachers]]`: Staff directory, salaries, teacher workspace (diary + gradebook).
  - `[[features/attendance]]`: Daily roll call, composite unique date constraints, offline buffering.
  - `[[features/academic-diary]]`: Digital homework diary, subject assignments, audio voice notes.
  - `[[features/super-admin]]`: Platform owner console (`basithunyawrr@gmail.com`), MRR, god-mode bar.
  - `[[features/ai-assistant]]`: Google GenAI assistant endpoint and classroom prompts.
  - `[[logs/CHANGELOG]]`: Engineering audit trail and post-commit sync log.
- **Operational Rules Established:**
  - Zero-Waste Context Rule (inspect `INDEX` and `TRACKER` first).
  - Continuous Graph Maintenance.
  - Post-Commit Sync Rule.

---

## 📅 2026-09-21: Phases 1–5 End-to-End Remediation & Hardening
- **Squad:** Maali, Bilal, Faris, Hamza, Tariq, Zara, Rayan, Sobia, Zubair.
- **Summary of Changes:**
  - **Git & Safety:** Hardened `.gitignore` with secret exclusions.
  - **Database & Schema:** Added `notNull()` on `schoolId` across all entities; added composite unique keys (`(school_id, roll_number)`, `(school_id, employee_code)`, `(student_id, date)`, `(school_id, challan_number)`); generated migration `0001_cheerful_gorilla_man.sql` and `0002_add_expenses_and_diaries.sql`; implemented PostgreSQL RLS with `SECURITY DEFINER` helpers in `supabase/migrations/20260921_comprehensive_rls.sql`.
  - **Auth & Routing:** Constant-time password hashing with SHA-256 before `timingSafeEqual` in `/api/auth/login`; removed Super Admin demo password bypass; implemented server-authoritative `authorizeAdminCaller`; eliminated IDOR; fixed student portal consolidation 301 redirect.
  - **Frontend & Hydration:** Resolved client hydration mismatch in `/apply` and `super-admin-portal.tsx`; hardened `role-gate.tsx` against cookie spoofing.
  - **Verification:** Configured Vitest `pool: 'threads'` with 12/12 passing tests; UBS static analysis scanner Exit Code 0.

---

## 📅 2026-09-25: Phases 1–4 Full Delivery (Git, Ship, Done)
- **Squad:** 👑 Maali (Lead), 🏗️ Faris, ⚡ Hamza, 🎨 Zara, 🗄️ Tariq, 🔒 Bilal, 🔍 Rayan, 🧪 Sobia, 📝 Zubair.
- **Phase 1 (Connection, Schema & Auth):** Consolidated Supabase client into `lib/supabase/client.ts`; removed dummy fallback URLs; fixed PostgREST column names (`month_year`, `students(...)`); added `expenses` & `diaries` tables + migration `0002_add_expenses_and_diaries.sql`; preserved permanent Super Admin configuration.
- **Phase 2 (Button Wiring, SPA Navigation & Security):** Replaced hard `window.location.href` calls across all 6 shells with `router.push()`; updated fee voucher clearance logic; built `/api/admissions/apply` with Drizzle; retired Prisma ORM completely; attached Arcjet rate limiting & bot shielding on `/api/auth/login` and `/api/ai/chat`; enabled strict TypeScript build checks and GitHub Actions CI.
- **Phase 3 (Usability, Mobile Nav, Accessibility & Academic Data):** Added mobile drawer nav on landing page; converted modals (`BankSettings`, `PaymentGateway`, `BulkImport`) to WCAG 2.1 AA dialogs; populated authentic dynamic term report cards & exam schedules in Parent Portal; built reusable accessible `ConfirmDeleteModal` preventing accidental data loss.
- **Phase 4 (Code Polish, Search, Performance & Cleanup):** Wired decorative searches with active debounced filters and Enter navigation; eliminated React index keys across admin, teacher, and timetable; standardized error boundaries and user toast/alert feedback; deleted detached Cloudflare worker and deprecated mock teacher file; enforced foreign key indexes in Drizzle schema and configured Supavisor-compatible connection pooling.
- **Quality Gates:** `tsc --noEmit` Exit 0, Vitest (16/16) Exit 0, UBS Exit 0, `npm run build` (44 routes) Exit 0.

---

### [Phases 1-4] Core Infrastructure & Hardening Milestone
*Date: September 2026*

**Summary:**
- Consolidated all database queries into Drizzle ORM (removed Prisma completely).
- Fixed Supabase fallback crash risk and aligned PostgREST column selections.
- Replaced hard `window.location.href` reloads with Next.js SPA routing across all portal shells.
- Fixed fee voucher payment bug and added Arcjet boundary security.
- Hardened serverless connection pooling via Supavisor (`prepare: false`) with foreign key indices.
- Passed all Quality Gates (0 tsc errors, 16/16 tests green, clean Turbopack build).

**Primary Linked Nodes:**
- [[architecture/database]] (Drizzle single ORM, Supavisor settings, migration 0002)
- [[architecture/routing]] (SPA shell navigation, Turbopack route tree)
- [[architecture/auth]] (Root Super Admin sealing, Arcjet shielding)
- [[features/finance]] (Voucher settlement fix, fee gateway modal)

---

## 🔄 Post-Commit Sync Protocol (For Future Tasks)
After every commit or major deliverable:
1. Update `[[TRACKER]]`: Move completed items from `## In Progress` to `## Completed`, add new items to `## Next Plans`.
2. Append a new timestamped entry to this file with:
   - Date & Commit Hash
   - Squad members involved
   - Summary of changes
   - Modified file links
   - New or updated `[[wikilinks]]` in the graph.
