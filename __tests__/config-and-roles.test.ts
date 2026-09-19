import { describe, it, expect } from 'vitest'
import {
  isSuperAdminEmail,
  normalizeRole,
  getHomeRoute,
  ROLE_HOME_ROUTES,
  ROLE_PORTAL_ROUTES,
  SUPER_ADMIN_EMAILS,
} from '../lib/config'

describe('Role & Multi-Portal Route Configuration', () => {
  it('normalizes various role casing and formats correctly', () => {
    expect(normalizeRole('school-admin')).toBe('school_admin')
    expect(normalizeRole('School_Admin')).toBe('school_admin')
    expect(normalizeRole('TEACHER')).toBe('teacher')
    expect(normalizeRole('  Parent  ')).toBe('parent')
    expect(normalizeRole('Student')).toBe('student')
    expect(normalizeRole('')).toBe('')
    expect(normalizeRole(null)).toBe('')
  })

  it('correctly validates website owner / super admin email boundaries', () => {
    expect(isSuperAdminEmail('basithunyawrr@gmail.com')).toBe(true)
    expect(isSuperAdminEmail('BASITHUNYAWRR@GMAIL.COM')).toBe(true)
    expect(isSuperAdminEmail('teacher@school.edu.pk')).toBe(false)
    expect(isSuperAdminEmail('principal@school.edu.pk')).toBe(false)
    expect(isSuperAdminEmail(null)).toBe(false)
    expect(SUPER_ADMIN_EMAILS).toContain('basithunyawrr@gmail.com')
  })

  it('maps the 3 public portals correctly and routes student into parents portal', () => {
    // 1. School Admin (School Owner)
    expect(getHomeRoute('school_admin')).toBe('/admin')
    expect(ROLE_PORTAL_ROUTES.school_admin).toBe('/admin/overview')

    // 2. Teacher Workspace
    expect(getHomeRoute('teacher')).toBe('/teacher')
    expect(ROLE_PORTAL_ROUTES.teacher).toBe('/teacher/classes')

    // 3. Parents Portal (Student is consolidated into Parents Portal)
    expect(getHomeRoute('parent')).toBe('/parent')
    expect(getHomeRoute('student')).toBe('/parent')
    expect(ROLE_PORTAL_ROUTES.parent).toBe('/parent/children')
    expect(ROLE_PORTAL_ROUTES.student).toBe('/parent/children')

    // Fallback
    expect(getHomeRoute('unknown_role')).toBe('/admin')
  })

  it('routes website owner exclusively to the private super-admin portal', () => {
    expect(getHomeRoute('super_admin', 'basithunyawrr@gmail.com')).toBe('/super-admin')
    expect(getHomeRoute('school_admin', 'basithunyawrr@gmail.com')).toBe('/super-admin')
    expect(getHomeRoute('teacher', 'basithunyawrr@gmail.com')).toBe('/super-admin')
    expect(getHomeRoute('parent', 'basithunyawrr@gmail.com')).toBe('/super-admin')
    expect(ROLE_PORTAL_ROUTES.super_admin).toBe('/super-admin/dashboard')
  })

  it('prevents non-owner users from receiving the super-admin home route', () => {
    expect(getHomeRoute('super_admin', 'imposter@school.edu.pk')).toBe('/admin')
  })
})
