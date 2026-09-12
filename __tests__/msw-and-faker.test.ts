import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { server } from '../mocks/server'
import { generateSchoolDataSet, generateFakeStudent } from '../lib/mock-data/faker-generator'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('MSW (Mock Service Worker) & Faker Integration', () => {
  it('generates realistic localized Pakistani school data using Faker', () => {
    const dataSet = generateSchoolDataSet(5, 3)

    expect(dataSet.students).toHaveLength(5)
    expect(dataSet.teachers).toHaveLength(3)
    expect(dataSet.challans).toHaveLength(5)

    const student = dataSet.students[0]
    expect(student.rollNumber).toMatch(/^2026-\d{3}$/)
    expect(student.guardianPhone).toMatch(/^\+92 3\d{2} \d{7}$/)
    expect(student.monthlyFeePKR).toBeGreaterThan(0)

    const teacher = dataSet.teachers[0]
    expect(teacher.employeeCode).toMatch(/^TCH-2026-\d{3}$/)
    expect(teacher.monthlySalaryPKR).toBeGreaterThan(0)
  })

  it('intercepts API requests using MSW in tests', async () => {
    const response = await fetch('/api/students')
    const students = await response.json()

    expect(response.status).toBe(200)
    expect(students).toEqual([
      { id: 'std-1', fullName: 'Ali Khan', rollNumber: '2026-001', grade: 'Class 5', section: 'A' },
      { id: 'std-2', fullName: 'Fatima Ahmed', rollNumber: '2026-002', grade: 'Class 5', section: 'A' },
      { id: 'std-3', fullName: 'Zainab Bibi', rollNumber: '2026-003', grade: 'Class 6', section: 'B' },
    ])
  })

  it('intercepts AI chat endpoint with MSW mock', async () => {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt: 'Check attendance' }),
    })
    const data = (await response.json()) as { text: string }

    expect(response.status).toBe(200)
    expect(data.text).toContain('Received query: "Check attendance"')
  })
})
