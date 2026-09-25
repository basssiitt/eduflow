import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      studentName,
      gender,
      gradeApplying,
      fatherName,
      guardianPhone,
      guardianEmail,
      city,
      trackingCode,
      schoolId: requestedSchoolId,
    } = body

    if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
      return NextResponse.json(
        { success: false, error: 'Student full name is required.' },
        { status: 400 }
      )
    }

    if (!gradeApplying || typeof gradeApplying !== 'string' || !gradeApplying.trim()) {
      return NextResponse.json(
        { success: false, error: 'Grade applying for is required.' },
        { status: 400 }
      )
    }

    // Resolve an authoritative school_id
    let targetSchoolId = requestedSchoolId

    if (!targetSchoolId) {
      const [firstSchool] = await db
        .select({ id: schema.schools.id })
        .from(schema.schools)
        .limit(1)

      if (firstSchool) {
        targetSchoolId = firstSchool.id
      }
    }

    if (!targetSchoolId) {
      // Fallback: provision a default school record if DB is brand new
      const [createdSchool] = await db
        .insert(schema.schools)
        .values({
          name: 'EduFlow City Campus',
          slug: `eduflow-${Date.now().toString(36)}`,
          city: city || 'Lahore',
          adminEmail: 'admin@eduflow.pk',
          trialEndsAt: new Date(Date.now() + 30 * 86400000),
          nextBillingDate: new Date(Date.now() + 30 * 86400000),
        })
        .returning({ id: schema.schools.id })

      targetSchoolId = createdSchool.id
    }

    const cleanRoll = (trackingCode || `APP-${Date.now()}`).slice(0, 50)

    const [inserted] = await db
      .insert(schema.students)
      .values({
        schoolId: targetSchoolId,
        fullName: studentName.trim(),
        rollNumber: cleanRoll,
        grade: gradeApplying.trim().slice(0, 20),
        section: 'A',
        gender: gender ? String(gender).slice(0, 10) : null,
        guardianName: fatherName ? String(fatherName).trim() : null,
        guardianPhone: guardianPhone ? String(guardianPhone).trim().slice(0, 30) : null,
        guardianEmail: guardianEmail ? String(guardianEmail).trim() : null,
        monthlyFee: '0.00',
        status: 'applied',
      })
      .returning()

    return NextResponse.json({
      success: true,
      studentId: inserted?.id,
      trackingCode: cleanRoll,
      message: 'Admission application submitted successfully.',
    })
  } catch (error: any) {
    console.error('Error submitting online admission application:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to submit admission application.',
      },
      { status: 500 }
    )
  }
}
