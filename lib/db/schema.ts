import { pgTable, text, timestamp, boolean, uuid, varchar, numeric } from 'drizzle-orm/pg-core'

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
})

export const subscriptionPayments = pgTable('subscription_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id).notNull(),
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
})

export const campuses = pgTable('campuses', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id),
  name: text('name').notNull(),
  city: text('city').notNull(),
  phone: varchar('phone', { length: 30 }),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull(),
  fullName: text('full_name').notNull(),
  role: text('role').notNull().default('school_admin'),
  schoolId: uuid('school_id').references(() => schools.id),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  schoolSetupComplete: boolean('school_setup_complete').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id),
  campusId: uuid('campus_id').references(() => campuses.id),
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
})

export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id),
  campusId: uuid('campus_id').references(() => campuses.id),
  fullName: text('full_name').notNull(),
  employeeCode: varchar('employee_code', { length: 50 }).notNull(),
  email: text('email'),
  phone: varchar('phone', { length: 30 }),
  department: text('department'),
  specialization: text('specialization'),
  monthlySalary: numeric('monthly_salary', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const attendance = pgTable('attendance', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id),
  studentId: uuid('student_id').references(() => students.id),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  status: varchar('status', { length: 20 }).notNull(), // present, absent, leave, late
  remarks: text('remarks'),
  markedAt: timestamp('marked_at', { withTimezone: true }).defaultNow().notNull(),
})

export const feeVouchers = pgTable('fee_vouchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  schoolId: uuid('school_id').references(() => schools.id),
  studentId: uuid('student_id').references(() => students.id),
  challanNumber: varchar('challan_number', { length: 50 }).notNull(),
  monthYear: varchar('month_year', { length: 20 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: varchar('due_date', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).default('unpaid'), // unpaid, paid, overdue
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
