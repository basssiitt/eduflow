# Teacher & Faculty Management Architecture

## Overview
The Teacher Management module provides faculty onboarding, payroll tracking, workload and subject allocation, and gives teachers a focused digital workspace for classroom management.

Primary Implementation Files:
- Server Actions: [`app/actions/teachers.ts`](file:///home/basit/eduflow/app/actions/teachers.ts)
- Teacher API Endpoints: [`app/api/admin/teachers/route.ts`](file:///home/basit/eduflow/app/api/admin/teachers/route.ts) & [`app/api/admin/teachers/import/route.ts`](file:///home/basit/eduflow/app/api/admin/teachers/import/route.ts)
- Teacher Portal Shell: [`components/teacher-shell.tsx`](file:///home/basit/eduflow/components/teacher-shell.tsx) & [`components/teacher-portal.tsx`](file:///home/basit/eduflow/components/teacher-portal.tsx)
- Diary Interface: [`components/teacher-diary.tsx`](file:///home/basit/eduflow/components/teacher-diary.tsx)
- Gradebook Interface: [`components/teacher-gradebook.tsx`](file:///home/basit/eduflow/components/teacher-gradebook.tsx)
- Database Model: `teachers` table in [`lib/db/schema.ts`](file:///home/basit/eduflow/lib/db/schema.ts)

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Faculty Lifecycle & Capabilities

### A. Staff Onboarding & Directory
- Schools track teachers with required attributes: Full Name, Employee Code (e.g. `TCH-042`), Email, Phone, Department (Science, Arts, Islamic Studies, Mathematics), Specialization, and Monthly Salary.
- Scoped strictly to the caller's school via composite constraint `teachers_school_emp_uq` (`school_id`, `employee_code`).

### B. Bulk CSV Import
- Admins can import faculty lists via CSV through [`app/api/admin/teachers/import/route.ts`](file:///home/basit/eduflow/app/api/admin/teachers/import/route.ts).
- Includes prototype pollution defense and email format sanitization.

### C. The Dedicated Teacher Workspace (`/teacher`)
- **Assigned Classes (`/teacher/classes`):** View roster of students enrolled in the teacher's sections.
- **Daily Digital Diary (`/teacher/diary`):** Post daily homework tasks, instructions, and audio recordings.
- **Gradebook & Assessments (`/teacher/gradebook`):** Direct entry of test marks, midterms, and annual exam scores with automatic grading and percentage calculations.

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/database|Database Architecture]]
- [[architecture/routing|Routing Architecture]]
- [[features/multi-tenancy|Multi-Tenancy Isolation]]
- [[features/academic-diary|Academic Diary & Audio Notes]]
- [[features/attendance|Attendance Marking]]
- [[TRACKER|Project Progress Tracker]]
