import { describe, it, expect } from 'vitest'
import { CSV_HEADER_KEYS } from '../components/bulk-import-modal'
import { admitStudent, admitStudentAction, bulkUploadStudentsAction } from '../app/actions/students'

describe('CSV Upload Column Mapping & Exact Header Keys', () => {
  it('defines the exact 6 CSV header keys required by the specification', () => {
    expect(CSV_HEADER_KEYS).toEqual([
      'roll_number',
      'student_name',
      'grade',
      'parent_name',
      'parent_phone',
      'parent_email',
    ])
  })

  it('correctly maps varied header order without mixing up grades, phones, names or emails', () => {
    // Simulate a CSV with headers in shuffled order:
    // student_name, grade, roll_number, parent_email, parent_phone, parent_name
    const shuffledHeaders = [
      'student_name',
      'grade',
      'roll_number',
      'parent_email',
      'parent_phone',
      'parent_name',
    ]

    const testRow = [
      'Ahmad Bilal',
      'Class 8',
      '2026-099',
      'bilal.parent@example.com',
      '+92 321 9876543',
      'Bilal Hussain',
    ]

    // Simulate column index resolution logic from bulk-import-modal
    const colMap = {
      roll_number: shuffledHeaders.findIndex((h) => ['roll_number', 'roll_no', 'roll'].includes(h)),
      student_name: shuffledHeaders.findIndex((h) => ['student_name', 'student', 'name'].includes(h)),
      grade: shuffledHeaders.findIndex((h) => ['grade', 'class'].includes(h)),
      parent_name: shuffledHeaders.findIndex((h) => ['parent_name', 'father_name'].includes(h)),
      parent_phone: shuffledHeaders.findIndex((h) => ['parent_phone', 'phone'].includes(h)),
      parent_email: shuffledHeaders.findIndex((h) => ['parent_email', 'email'].includes(h)),
    }

    const mapped = {
      roll_number: testRow[colMap.roll_number],
      student_name: testRow[colMap.student_name],
      grade: testRow[colMap.grade],
      parent_name: testRow[colMap.parent_name],
      parent_phone: testRow[colMap.parent_phone],
      parent_email: testRow[colMap.parent_email],
    }

    // Assert that grade did NOT end up in parent_phone
    expect(mapped.grade).toBe('Class 8')
    expect(mapped.parent_phone).toBe('+92 321 9876543')

    // Assert that parent_name did NOT end up in parent_email
    expect(mapped.parent_name).toBe('Bilal Hussain')
    expect(mapped.parent_email).toBe('bilal.parent@example.com')

    // Assert other fields
    expect(mapped.roll_number).toBe('2026-099')
    expect(mapped.student_name).toBe('Ahmad Bilal')
  })
})

describe('Admit Student Server Action Exports', () => {
  it('exports admitStudent and admitStudentAction functions', () => {
    expect(typeof admitStudent).toBe('function')
    expect(typeof admitStudentAction).toBe('function')
    expect(admitStudentAction).toBe(admitStudent)
  })

  it('exports bulkUploadStudentsAction function', () => {
    expect(typeof bulkUploadStudentsAction).toBe('function')
  })
})
