# EduFlow OS — Master Knowledge Graph Index

Welcome to **EduFlow OS**, the interactive bidirectional knowledge graph representing the entire codebase, architecture, and operational lifecycle of **EduFlow** (Next.js 16 Multi-Tenant School Management Platform).

> [!TIP]
> Press `Ctrl + G` in Obsidian to open the **Graph View**. All architecture layers, feature modules, and tracking nodes are interconnected via bidirectional wikilinks to form visual conceptual clusters.

---

## 🏛️ Core Architecture Clusters

The architectural foundation of the EduFlow platform:

- [[architecture/routing|Next.js App Router & Portal Routing]]: Portal route groups (`(school-admin)`, `(teacher)`, `(parent)`, `(super-admin)`), 301 redirects, server actions, and middleware.
- [[architecture/database|Drizzle ORM Schema & PostgreSQL RLS]]: Relational models (`schools`, `students`, `teachers`, `attendance`, `fee_vouchers`, `expenses`, `diaries`), composite unique constraints, and Row-Level Security policies.
- [[architecture/auth|Supabase Auth, Sessions & RBAC]]: Zero-trust authorization via `authorizeAdminCaller`, constant-time password hashing, role gates, and Super Admin whitelisting.
- [[architecture/edge|Cloudflare Workers & Edge Telemetry]]: Low-latency health pings (`/edge/health`), sync buffering (`/edge/sync-ping`), and offline reconciliation for Pakistani connectivity.

---

## 📦 Feature Module Clusters

Domain features engineered specifically for Pakistani schools:

- [[features/multi-tenancy|Multi-Tenancy & School Isolation]]: Strict tenant partitioning via `school_id`, automatic schema cascades, and dedicated onboarding pipelines.
- [[features/finance-billing|Finance, Fee Vouchers & Billing Gateway]]: 3-Part Bank Challans (Bank/School/Student copies), 1Link/Kuickpay payment codes, JazzCash/EasyPaisa modal, arrears ledger, and platform SaaS subscription tiers.
- [[features/students|Student & Admissions Management]]: Online admission portal (`/apply`), PapaParse CSV bulk import, unique roll numbering per school, and parent visibility.
- [[features/teachers|Teacher & Faculty Management]]: Staff directory, employee codes, salary records, classroom rosters, and dedicated teacher workspace.
- [[features/attendance|Daily Attendance & Offline Sync]]: Daily roll-call status logging (`present`, `absent`, `leave`, `late`), composite unique day constraint, and local offline buffer.
- [[features/academic-diary|Academic Diary, Homework & Voice Notes]]: Daily homework logs, subject-wise assignments, and recorded Urdu/English audio voice notes for parents.
- [[features/super-admin|Super Admin Console & SaaS Subscriptions]]: Executive dashboard for `basithunyawrr@gmail.com`, tenant health, MRR in PKR, and god-mode inspection.
- [[features/ai-assistant|AI Classroom & Administrative Assistant]]: Google GenAI assistant integration for bilingual lesson plans, fee reminder notices, and parent queries.

---

## 🧭 Project Management & Activity Logs

- [[TRACKER|Project Progress Tracker]]: Active tracking of Completed deliverables, In Progress work, and Next Phase roadmap.
- [[logs/CHANGELOG|Squad Activity & Commit Changelog]]: Timestamped engineering audit log, changes, and graph sync events.

---

## ⚡ Operational Navigation Rules

1. **Zero-Waste Context Rule:** Before reading any code for a task, ALWAYS inspect `[[INDEX]]` and `[[TRACKER]]` first. Follow specific wikilinks to identify and read ONLY the exact files needed. Never blindly grep or re-read unchanged modules.
2. **Continuous Graph Maintenance:** When creating new components, routes, or database tables, create or update the matching `.md` node in the vault and link it with `[[wikilinks]]`.
3. **Post-Commit Sync Rule:** After any commit or major task completion, update `[[TRACKER]]` and append a log entry to `[[logs/CHANGELOG]]`.
