# Attendance Tracking & Offline Sync Architecture

## Overview
The Attendance Tracking module enables daily roll call for students, calculates real-time attendance ratios, logs leaves and late entries, and delivers instant visibility to school administrators and parents.

Primary Implementation Files:
- Admin Attendance View: [`app/(school-admin)/admin/attendance/page.tsx`](file:///home/basit/eduflow/app/(school-admin)/admin/attendance/page.tsx)
- Teacher Classroom View: [`components/teacher-portal.tsx`](file:///home/basit/eduflow/components/teacher-portal.tsx)
- Parent Child Record: [`components/parent-portal.tsx`](file:///home/basit/eduflow/components/parent-portal.tsx)
- Offline Client Handler: [`components/offline-client.tsx`](file:///home/basit/eduflow/components/offline-client.tsx)
- Edge Sync Buffering: [`workers/index.ts`](file:///home/basit/eduflow/workers/index.ts)
- Database Model: `attendance` table in [`lib/db/schema.ts`](file:///home/basit/eduflow/lib/db/schema.ts)

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Data Schema & Integrity Constraints

From [`lib/db/schema.ts`](file:///home/basit/eduflow/lib/db/schema.ts):
- **Status Values:** `present`, `absent`, `leave`, `late`.
- **Date Format:** Normalized ISO string `YYYY-MM-DD`.
- **Composite Unique Constraint:**
  ```sql
  CONSTRAINT attendance_student_date_uq UNIQUE (student_id, date)
  ```
  Prevents duplicate marks per student per day, enabling atomic upserts (`ON CONFLICT (student_id, date) DO UPDATE`).
- **Composite Index:** `(school_id, date)` accelerates whole-school daily attendance summary queries.

---

## 2. Offline-First Attendance Marking

Pakistani classrooms frequently experience cellular dead-zones or local Wi-Fi disruptions during morning roll call. EduFlow accommodates this via:
1. **Local State Buffering:** The teacher's interface stores the marked status array in browser `localStorage`.
2. **Offline Detection:** [`components/offline-client.tsx`](file:///home/basit/eduflow/components/offline-client.tsx) displays an offline indicator without halting user interaction.
3. **Edge Worker Reconciliation:** As soon as connectivity returns, the buffer is dispatched to `/edge/sync-ping` on the Cloudflare Edge Worker, and flushed cleanly to PostgreSQL.

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/database|Database Architecture]]
- [[architecture/edge|Edge Workers & Sync]]
- [[features/students|Student Directory]]
- [[features/teachers|Teacher Workflows]]
- [[TRACKER|Project Progress Tracker]]
