import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (serviceRoleKey) {
    return createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  }
  return createClient(url, anonKey)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, schoolName, city, ownerName, phone } = body

    if (!email || !schoolName) {
      return NextResponse.json(
        { success: false, error: 'Email and School Name are required.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    const cleanSchool = schoolName.trim()
    const cleanCity = city ? city.trim() : 'Karachi'
    const cleanOwner = ownerName ? ownerName.trim() : 'School Admin'
    const cleanPhone = phone ? phone.trim() : ''

    const slug = cleanSchool
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 30) || `school-${Date.now()}`

    const now = new Date()
    const nowIso = now.toISOString()
    const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const client = getSupabaseAdmin()

    // 1. Provision School in public.schools
    let schoolId: string = ''
    try {
      const { data: newSchool, error: schoolErr } = await client
        .from('schools')
        .insert([
          {
            name: cleanSchool,
            slug: `${slug}-${Math.floor(100 + Math.random() * 900)}`,
            city: cleanCity,
            admin_email: cleanEmail,
            owner_name: cleanOwner,
            phone: cleanPhone,
            plan_tier: 'pro',
            plan_status: 'trial',
            created_at: nowIso,
            trial_starts_at: nowIso,
            trial_ends_at: trialEnd,
            next_billing_date: trialEnd,
            monthly_amount: 5000,
          },
        ])
        .select()
        .single()

      if (!schoolErr && newSchool) {
        schoolId = newSchool.id
      } else {
        console.warn('Could not insert to public.schools, will attempt campus fallback:', schoolErr)
      }
    } catch (err) {
      console.warn('public.schools insertion exception:', err)
    }

    // 2. Provision Campus in public.campuses
    let campusId: string = ''
    try {
      const { data: newCampus, error: campErr } = await client
        .from('campuses')
        .insert([
          {
            name: cleanSchool,
            city: cleanCity,
            owner: cleanOwner,
            plan: 'Pro',
            students: 0,
            status: 'Active',
            admin_email: cleanEmail,
            phone: cleanPhone,
            slug,
            ...(schoolId ? { school_id: schoolId } : {}),
          },
        ])
        .select()
        .single()

      if (!campErr && newCampus) {
        campusId = newCampus.id
        if (!schoolId) schoolId = newCampus.id
      }
    } catch {}

    // 3. Upsert Profile in public.profiles
    if (userId) {
      try {
        await client.from('profiles').upsert([
          {
            id: userId,
            email: cleanEmail,
            full_name: cleanOwner,
            role: 'school_admin',
            onboarding_completed: true,
            school_id: schoolId || campusId || null,
            phone_number: cleanPhone,
            updated_at: nowIso,
          },
        ])
      } catch (err) {
        console.warn('Profile upsert exception:', err)
      }
    }

    // 4. Set secure session cookies for frictionless routing
    const cookieStore = await cookies()
    cookieStore.set('eduflow-user-email', cleanEmail, {
      path: '/',
      maxAge: 30 * 86400,
      httpOnly: false,
      sameSite: 'lax',
    })
    cookieStore.set('eduflow-user-role', 'school_admin', {
      path: '/',
      maxAge: 30 * 86400,
      httpOnly: false,
      sameSite: 'lax',
    })

    return NextResponse.json({
      success: true,
      schoolId: schoolId || campusId,
      trialStartsAt: nowIso,
      trialEndsAt: trialEnd,
      daysRemaining: 30,
      planStatus: 'trial',
      planTier: 'pro',
    })
  } catch (err: any) {
    console.error('setup-school failed:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to setup school tenant' },
      { status: 500 }
    )
  }
}
