# Super Admin, Platform SaaS & Subscription Management

## Overview
The Super Admin Portal is the private executive console for the EduFlow platform owner (`basithunyawrr@gmail.com`). It manages tenant lifecycle, SaaS subscriptions, revenue metrics (MRR/ARR in PKR), school onboarding status, and system-wide edge telemetry.

Primary Implementation Files:
- Super Admin Portal: [`components/super-admin-portal.tsx`](file:///home/basit/eduflow/components/super-admin-portal.tsx)
- Super Admin Shell: [`components/super-admin-shell.tsx`](file:///home/basit/eduflow/components/super-admin-shell.tsx)
- God-Mode Tenant Switcher: [`components/god-mode-bar.tsx`](file:///home/basit/eduflow/components/god-mode-bar.tsx)
- API Endpoint: [`app/api/super-admin/schools/route.ts`](file:///home/basit/eduflow/app/api/super-admin/schools/route.ts)
- Config & Whitelist: [`lib/config.ts`](file:///home/basit/eduflow/lib/config.ts)
- Database Models: `schools` and `subscription_payments` in [`lib/db/schema.ts`](file:///home/basit/eduflow/lib/db/schema.ts)

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Security & Privilege Boundaries

- **Whitelist Enforcement:** [`lib/config.ts`](file:///home/basit/eduflow/lib/config.ts) checks `isSuperAdminEmail(email)`. Only accounts explicitly declared in `SUPER_ADMIN_EMAILS` can access `/super-admin/*`.
- **Zero-Bypass Architecture:** Super Admin demo passwords have been removed. Every request requires an authenticated Supabase session verified by the server.
- **Tenant Context Impersonation (God Mode):** Via [`components/god-mode-bar.tsx`](file:///home/basit/eduflow/components/god-mode-bar.tsx), the super administrator can inspect specific tenant views for customer support without corrupting tenant state.

---

## 2. Platform Capabilities

### A. School Lifecycle Management
- View all registered schools across Pakistan (Karachi, Lahore, Rawalpindi, Peshawar, Quetta, Hyderabad, etc.).
- Inspect plan tier (`starter`, `pro`, `enterprise`), subscription status (`trial`, `active`, `past_due`, `canceled`), and days remaining on trial.
- Instant toggle to extend trials or activate subscriptions upon bank payment verification.

### B. Platform Revenue Dashboard
- Real-time calculation of Monthly Recurring Revenue (MRR) in PKR.
- Historical ledger of `subscription_payments` received via Kuickpay, bank transfer, or online gateways.

### C. Edge & Infrastructure Telemetry
- Monitors edge latency, database connection pools, and worker health pings.

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/auth|Authentication & RBAC]]
- [[architecture/routing|Routing Architecture]]
- [[features/multi-tenancy|Multi-Tenancy Isolation]]
- [[features/finance-billing|SaaS Subscription Billing]]
- [[TRACKER|Project Progress Tracker]]
