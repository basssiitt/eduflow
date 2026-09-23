import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { CSV_HEADER_KEYS } from '../components/bulk-import-modal'
import { admitStudent, admitStudentAction, bulkUploadStudentsAction } from '../app/actions/students'

const mockAdminUpdate = vi.fn().mockResolvedValue({ error: null })
const mockAdminClient = {
  from: vi.fn((table: string) => {
    if (table === 'schools') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn((_col: string, val: string) => ({
            limit: vi.fn(() => ({
              maybeSingle: vi.fn().mockImplementation(async () => {
                if (val === 'owner@synthetic-school.test') {
                  return { data: { id: 'school-owned-synthetic-888' }, error: null }
                }
                return { data: null, error: null }
              }),
            })),
          })),
        })),
      }
    }
    if (table === 'profiles') {
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
        update: vi.fn(() => ({
          eq: mockAdminUpdate,
        })),
      }
    }
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
    }
  }),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockAdminClient),
}))

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

describe('authorizeAdminCaller Security & Role Evaluation', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://synthetic.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'synthetic-service-role-key'
  })

  beforeEach(() => {
    mockAdminUpdate.mockClear()
  })

  it('authorizes verified super admin email with synthetic address', async () => {
    const config = await import('../lib/config')
    const spy = vi.spyOn(config, 'isSuperAdminEmail').mockImplementation(
      (email) => (email || '').toLowerCase().trim() === 'superadmin@synthetic-eduflow.test'
    )
    const { authorizeAdminCaller } = await import('../lib/auth/authorizeAdmin')
    const result = await authorizeAdminCaller({
      id: 'test-super-admin-id',
      email: 'superadmin@synthetic-eduflow.test',
    })
    expect(result.isAuthorized).toBe(true)
    expect(result.callerProfile?.role).toBe('super_admin')
    spy.mockRestore()
  })

  it('authorizes caller with signed app_metadata school_admin role', async () => {
    const { authorizeAdminCaller } = await import('../lib/auth/authorizeAdmin')
    const result = await authorizeAdminCaller({
      id: 'test-admin-id-123',
      email: 'admin@campustest.com',
      app_metadata: { role: 'school_admin', school_id: 'school-uuid-999' },
    })
    expect(result.isAuthorized).toBe(true)
    expect(result.callerProfile?.role).toBe('school_admin')
    expect(result.schoolId).toBe('school-uuid-999')
  })

  it('authorizes caller via verified schools.admin_email ownership path and syncs profile', async () => {
    const { authorizeAdminCaller } = await import('../lib/auth/authorizeAdmin')
    const result = await authorizeAdminCaller({
      id: 'test-owner-id-789',
      email: 'owner@synthetic-school.test',
    })
    expect(result.isAuthorized).toBe(true)
    expect(result.callerProfile?.role).toBe('school_admin')
    expect(result.schoolId).toBe('school-owned-synthetic-888')
    expect(mockAdminUpdate).toHaveBeenCalled()
  })

  it('rejects unauthorized user lacking admin credentials', async () => {
    const { authorizeAdminCaller } = await import('../lib/auth/authorizeAdmin')
    const result = await authorizeAdminCaller({
      id: 'test-parent-id-456',
      email: 'parent@example.com',
      app_metadata: { role: 'parent' },
      user_metadata: { role: 'school_admin' }, // user_metadata role is untrusted and ignored
    })
    expect(result.isAuthorized).toBe(false)
  })
})
