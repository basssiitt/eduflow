import { pgTable, text, timestamp, integer, boolean, uuid, varchar, numeric } from 'drizzle-orm/pg-core'

export const campuses = pgTable('campuses', {
  id: uuid('id').defaultRandom().primaryKey(),
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
  role: text('role').notNull().default('parent'),
  schoolId: text('school_id'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const students = pgTable('students', {
  id: uuid('id').defaultRandom().primaryKey(),
  campusId: uuid('campus_id').references(() => campuses.id),
  fullName: text('full_name').notNull(),
  rollNumber: varchar('roll_number', { length: 50 }).notNull(),
  grade: varchar('grade', { length: 20 }).notNull(),
  section: varchar('section', { length: 10 }).notNull(),
  gender: varchar('gender', { length: 10 }),
  guardianName: text('guardian_name'),
  guardianPhone: varchar('guardian_phone', { length: 30 }),
  monthlyFee: numeric('monthly_fee', { precision: 10, scale: 2 }).default('0.00'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const teachers = pgTable('teachers', {
  id: uuid('id').defaultRandom().primaryKey(),
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
  studentId: uuid('student_id').references(() => students.id),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  status: varchar('status', { length: 20 }).notNull(), // present, absent, leave, late
  remarks: text('remarks'),
  markedAt: timestamp('marked_at', { withTimezone: true }).defaultNow().notNull(),
})

export const feeVouchers = pgTable('fee_vouchers', {
  id: uuid('id').defaultRandom().primaryKey(),
  studentId: uuid('student_id').references(() => students.id),
  challanNumber: varchar('challan_number', { length: 50 }).notNull(),
  monthYear: varchar('month_year', { length: 20 }).notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  dueDate: varchar('due_date', { length: 10 }).notNull(),
  status: varchar('status', { length: 20 }).default('unpaid'), // unpaid, paid, overdue
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
