import { http, HttpResponse } from 'msw'

export const handlers = [
  // Mock AI Chat Endpoint
  http.post('/api/ai/chat', async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { prompt?: string }
    return HttpResponse.json({
      text: `[MSW Mock Response] Received query: "${body.prompt || ''}". EduFlow records verified.`,
      sources: ['Mock School Records DB'],
    })
  }),

  // Mock Students API
  http.get('/api/students', () => {
    return HttpResponse.json([
      { id: 'std-1', fullName: 'Ali Khan', rollNumber: '2026-001', grade: 'Class 5', section: 'A' },
      { id: 'std-2', fullName: 'Fatima Ahmed', rollNumber: '2026-002', grade: 'Class 5', section: 'A' },
      { id: 'std-3', fullName: 'Zainab Bibi', rollNumber: '2026-003', grade: 'Class 6', section: 'B' },
    ])
  }),

  // Mock Attendance API
  http.get('/api/attendance/summary', () => {
    return HttpResponse.json({
      date: new Date().toISOString().split('T')[0],
      totalStudents: 450,
      present: 423,
      absent: 18,
      leave: 9,
      attendanceRate: '94.0%',
    })
  }),

  // Mock Fee Challans API
  http.get('/api/fees/challans', () => {
    return HttpResponse.json([
      { id: 'chn-001', studentName: 'Ali Khan', amount: 4500, status: 'unpaid', dueDate: '10-Oct-2026' },
      { id: 'chn-002', studentName: 'Fatima Ahmed', amount: 4500, status: 'paid', dueDate: '10-Oct-2026' },
    ])
  }),
]
