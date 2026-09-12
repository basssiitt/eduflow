import { faker } from '@faker-js/faker'

export interface FakeStudent {
  id: string
  fullName: string
  rollNumber: string
  grade: string
  section: string
  gender: 'Male' | 'Female'
  guardianName: string
  guardianPhone: string
  monthlyFeePKR: number
  status: 'active' | 'inactive' | 'transferred'
}

export interface FakeTeacher {
  id: string
  employeeCode: string
  fullName: string
  email: string
  phone: string
  department: string
  specialization: string
  monthlySalaryPKR: number
  status: 'active' | 'on_leave' | 'resigned'
}

export interface FakeFeeChallan {
  challanNumber: string
  studentName: string
  grade: string
  month: string
  tuitionFeePKR: number
  labExamFeePKR: number
  totalPKR: number
  dueDate: string
  status: 'paid' | 'unpaid' | 'overdue'
}

const PAKISTANI_MALE_NAMES = [
  'Muhammad Ali', 'Ahmed Raza', 'Hamza Tariq', 'Bilal Hassan', 'Usman Ghani',
  'Zayn Malik', 'Mustafa Kamal', 'Farhan Saeed', 'Saad Rafique', 'Taha Siddiqui',
  'Abdullah Shah', 'Hassan Raza', 'Omer Farooq', 'Daniyal Aziz', 'Shahmeer Khan'
]

const PAKISTANI_FEMALE_NAMES = [
  'Fatima Zahra', 'Ayesha Noor', 'Zainab Bibi', 'Maryam Nawaz', 'Hafsa Tariq',
  'Khadija Tul Kubra', 'Eman Fatima', 'Laiba Khan', 'Anaya Rehman', 'Hania Amir',
  'Mahnoor Baloch', 'Sidra Tul Muntaha', 'Dua Fatima', 'Zunaira Aslam', 'Sana Mir'
]

const DEPARTMENTS = [
  'Sciences & Mathematics',
  'Languages (Urdu & English)',
  'Islamiyat & Pakistan Studies',
  'Computer Science & IT',
  'Arts, Physical Education & Sports'
]

const GRADES = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9 (Matric)', 'Class 10 (Matric)']
const SECTIONS = ['A', 'B', 'C']

export function generateFakeStudent(index: number = 1): FakeStudent {
  const isFemale = faker.datatype.boolean()
  const nameList = isFemale ? PAKISTANI_FEMALE_NAMES : PAKISTANI_MALE_NAMES
  const fullName = faker.helpers.arrayElement(nameList)
  const guardianList = PAKISTANI_MALE_NAMES
  const guardianName = faker.helpers.arrayElement(guardianList) + ' (Father)'

  return {
    id: faker.string.uuid(),
    fullName,
    rollNumber: `2026-${String(index).padStart(3, '0')}`,
    grade: faker.helpers.arrayElement(GRADES),
    section: faker.helpers.arrayElement(SECTIONS),
    gender: isFemale ? 'Female' : 'Male',
    guardianName,
    guardianPhone: `+92 3${faker.string.numeric(2)} ${faker.string.numeric(7)}`,
    monthlyFeePKR: faker.helpers.arrayElement([3500, 4500, 5500, 6500, 8000]),
    status: 'active',
  }
}

export function generateFakeTeacher(index: number = 1): FakeTeacher {
  const isFemale = faker.datatype.boolean()
  const nameList = isFemale ? PAKISTANI_FEMALE_NAMES : PAKISTANI_MALE_NAMES
  const fullName = (isFemale ? 'Ms. ' : 'Mr. ') + faker.helpers.arrayElement(nameList)
  const department = faker.helpers.arrayElement(DEPARTMENTS)

  return {
    id: faker.string.uuid(),
    employeeCode: `TCH-2026-${String(index).padStart(3, '0')}`,
    fullName,
    email: faker.internet.email({ firstName: fullName.replace(/^(Mr\.|Ms\.)\s*/, '').split(' ')[0] }).toLowerCase(),
    phone: `+92 3${faker.string.numeric(2)} ${faker.string.numeric(7)}`,
    department,
    specialization: department.split(' ')[0] + ' Specialist',
    monthlySalaryPKR: faker.helpers.arrayElement([45000, 55000, 65000, 80000, 110000]),
    status: 'active',
  }
}

export function generateFakeFeeChallan(student: FakeStudent, month: string = 'October 2026'): FakeFeeChallan {
  const tuition = student.monthlyFeePKR
  const labExam = 500
  return {
    challanNumber: `CHN-${faker.string.numeric(6)}`,
    studentName: student.fullName,
    grade: `${student.grade}-${student.section}`,
    month,
    tuitionFeePKR: tuition,
    labExamFeePKR: labExam,
    totalPKR: tuition + labExam,
    dueDate: '10-Oct-2026',
    status: faker.helpers.arrayElement(['paid', 'unpaid', 'paid', 'paid', 'overdue']),
  }
}

export function generateSchoolDataSet(studentCount: number = 10, teacherCount: number = 5) {
  const students = Array.from({ length: studentCount }, (_, i) => generateFakeStudent(i + 1))
  const teachers = Array.from({ length: teacherCount }, (_, i) => generateFakeTeacher(i + 1))
  const challans = students.map((s) => generateFakeFeeChallan(s))

  return { students, teachers, challans }
}
