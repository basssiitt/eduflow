# AI Classroom & Administrative Assistant Architecture

## Overview
EduFlow integrates generative AI using Google's GenAI SDK (`@google/genai`) to provide an intelligent assistant for teachers, administrators, and parents.

Primary Implementation Files:
- API Handler: [`app/api/ai/chat/route.ts`](file:///home/basit/eduflow/app/api/ai/chat/route.ts)
- Package Dependency: `@google/genai` (v2.19.0)

Part of the [[INDEX|EduFlow OS Knowledge Graph]].

---

## 1. Capabilities & Use Cases

- **For Teachers:** Formulating lesson plans, creating bilingual (Urdu/English) test questions, and drafting homework notes.
- **For School Administrators:** Summarizing weekly attendance patterns, drafting fee reminder notices for WhatsApp broadcast, and analyzing expense trends.
- **For Parents:** Asking questions regarding school policies, fee challan deadlines, and academic calendars.

---

## 2. Security & Quota Controls

- **Authenticated Session Gate:** Unauthenticated requests are rejected immediately with `401 Unauthorized`.
- **Tenant Context Injection:** The assistant prompt is automatically injected with the current school's context (e.g. school name, city, educational board) to ensure localized and relevant responses.
- **Safe Fallback:** If the `GEMINI_API_KEY` is not provisioned in the environment, the endpoint responds with an informative, user-friendly mock payload rather than crashing.

---

## Related Notes
- [[INDEX|Master Hub]]
- [[architecture/routing|Routing Architecture]]
- [[features/teachers|Teacher Workflows]]
- [[features/academic-diary|Academic Diary Notes]]
- [[TRACKER|Project Progress Tracker]]
