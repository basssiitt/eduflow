import { pgTable, text, timestamp, boolean, uuid, varchar, numeric, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const schools = pgTable('schools', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  city: text('city').default('Karachi'),
  adminEmail: text('admin_email'),
  ownerName: text('owner_name'),
  phone: varchar('phone', { length: 30 }),
  planTier: text('plan_tier').notNull().default('pro'), // 'starter', 'pro', 'enterprise'
  planStatus: text('plan_status').notNull().default('trial'), // 'trial', 'active', 'past_due', 'canceled'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  trialStartsAt: timestamp('trial_starts_at', { withTimezone: true }).defaultNow().notNull(),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }).notNull(),
  firstPaidAt: timestamp('first_paid_at', { withTimezone: true }),
  lastPaidAt: timestamp('last_paid_at', { withTimezone: true }),
  nextBillingDate: timestamp('next_billing_date', { withTimezone: true }).notNull(),
  monthlyAmount: numeric('monthly_amount', { precision: 12, scale: 2 }).default('5000.00').notNull(),
  schoolSetupComplete: boolean('school_setup_complete').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('schools_slug_idx').on(table.slug),
  index('schools_created_at_idx').on(table.createdAt),
])

export const subscriptionPayments = pgTable('subscription_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('PKR').notNull(),
  billingCycle: varchar('billing_cycle', { length: 20 }).default('monthly').notNull(),
  paymentMethod: varchar('payment_method', { length: 30 }).default('bank_transfer').notNull(),
  status: varchar('status', { length: 20 }).default('paid').notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }).defaultNow().notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  referenceNo: text('reference_no'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('sub_payments_school_id_idx').on(table.schoolId),
  index('sub_payments_paid_at_idx').on(table.paidAt),
])

export const campuses = pgTable('campuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  phone: varchar('phone', { length: 30 }),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('campuses_school_id_idx').on(table.schoolId),
])

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('school_admin'),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'set null' }),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  schoolSetupComplete: boolean('school_setup_complete').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('profiles_email_idx').on(table.email),
  index('profiles_school_id_idx').on(table.schoolId),
])

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  campusId: uuid('campus_id').references(() => campuses.id, { onDelete: 'set null' }),
  parentId: uuid('parent_id'),
  fullName: text('full_name').notNull(),
  rollNumber: varchar('roll_number', { length: 50 }).notNull(),
  grade: varchar('grade', { length: 20 }).notNull(),
  section: varchar('section', { length: 10 }).notNull(),
  gender: varchar('gender', { length: 10 }),
  guardianName: text('guardian_name'),
  guardianPhone: varchar('guardian_phone', { length: 30 }),
  guardianEmail: text('guardian_email'),
  monthlyFee: numeric('monthly_fee', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('students_school_id_idx').on(table.schoolId),
  index('students_parent_id_idx').on(table.parentId),
  uniqueIndex('students_school_roll_uq').on(table.schoolId, table.rollNumber),
])

export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  campusId: uuid('campus_id').references(() => campuses.id, { onDelete: 'set null' }),
  fullName: text('full_name').notNull(),
  employeeCode: varchar('employee_code', { length: 50 }).notNull(),
  email: text('email'),
  phone: varchar('phone', { length: 30 }),
  department: text('department'),
  specialization: text('specialization'),
  monthlySalary: numeric('monthly_salary', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('teachers_school_id_idx').on(table.schoolId),
  uniqueIndex('teachers_school_emp_uq').on(table.schoolId, table.employeeCode),
])

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  status: varchar('status', { length: 20 }).notNull(), // present, absent, leave, late
  remarks: text('remarks'),
  markedAt: timestamp('marked_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('attendance_school_date_idx').on(table.schoolId, table.date),
  uniqueIndex('attendance_student_date_uq').on(table.studentId, table.date),
])

export const feeVouchers = pgTable('fee_vouchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }).notNull(),
  challanNumber: varchar('challan_number', { length: 50 }).notNull(),
  monthYear: varchar('month_year', { length: 20 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: varchar('due_date', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).default('unpaid'), // unpaid, paid, overdue
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('fee_vouchers_school_status_idx').on(table.schoolId, table.status),
  uniqueIndex('fee_vouchers_school_challan_uq').on(table.schoolId, table.challanNumber),
])
