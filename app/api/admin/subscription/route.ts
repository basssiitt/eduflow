import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import {
  parseSchoolSubscription,
  computeNextBillingDate,
  SchoolSubscription,
  SubscriptionPaymentRecord,
} from '@/lib/subscription'

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

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userEmail = cookieStore.get('eduflow-user-email')?.value?.toLowerCase()
    const url = new URL(request.url)
    const schoolIdParam = url.searchParams.get('schoolId')
    const fetchAll = url.searchParams.get('all') === 'true'

    const client = getSupabaseAdmin()

    // 0. Super-Admin fetch all schools & subscriptions
    if (fetchAll) {
      let schoolsList: any[] = []
      try {
        const { data: sData } = await client
          .from('schools')
          .select('*')
          .order('created_at', { ascending: false })
        if (sData && sData.length > 0) {
          schoolsList = sData
        }
      } catch {}

      if (schoolsList.length === 0) {
        try {
          const { data: cData } = await client
            .from('campuses')
            .select('*')
            .order('created_at', { ascending: false })
          if (cData && cData.length > 0) {
            schoolsList = cData.map((c: any) => {
              const regDate = c.created_at || new Date().toISOString()
              const trialEnd = new Date(new Date(regDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
              return {
                id: c.id,
                name: c.name || 'Campus',
                slug: c.slug || 'campus',
                city: c.city || 'Karachi',
                admin_email: c.admin_email || '',
                owner_name: c.owner || 'Principal',
                phone: c.phone || '',
                plan_tier: (c.plan || 'pro').toLowerCase(),
                plan_status: c.status?.toLowerCase() === 'active' ? 'active' : 'trial',
                created_at: regDate,
                trial_starts_at: regDate,
                trial_ends_at: trialEnd,
                next_billing_date: trialEnd,
                monthly_amount: 5000,
              }
            })
          }
        } catch {}
      }

      const subscriptions = schoolsList.map((s) => parseSchoolSubscription(s))
      let payments: SubscriptionPaymentRecord[] = []
      try {
        const { data: pData } = await client
          .from('subscription_payments')
          .select('*')
          .order('paid_at', { ascending: false })
        if (pData && Array.isArray(pData)) {
          payments = pData.map((p: any) => ({
            id: p.id,
            schoolId: p.school_id,
            amount: Number(p.amount) || 5000,
            currency: p.currency || 'PKR',
            billingCycle: p.billing_cycle || 'monthly',
            paymentMethod: p.payment_method || 'bank_transfer',
            status: p.status || 'paid',
            paidAt: p.paid_at || p.created_at,
            periodStart: p.period_start || p.created_at,
            periodEnd: p.period_end || p.created_at,
            referenceNo: p.reference_no,
            notes: p.notes,
          }))
        }
      } catch {}

      return NextResponse.json({
        success: true,
        schools: subscriptions,
        payments,
      })
    }

    let schoolRow: any = null
    let schoolId: string | null = schoolIdParam

    // 1. If schoolIdParam is supplied, fetch directly
    if (schoolId) {
      const { data: s } = await client
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .maybeSingle()
      if (s) schoolRow = s
    }

    // 2. If not found by ID, look up via user email
    if (!schoolRow && userEmail) {
      // First look in profiles for school_id
      const { data: profile } = await client
        .from('profiles')
        .select('school_id')
        .eq('email', userEmail)
        .maybeSingle()

      if (profile?.school_id) {
        schoolId = profile.school_id
        const { data: s } = await client
          .from('schools')
          .select('*')
          .eq('id', schoolId)
          .maybeSingle()
        if (s) schoolRow = s
      }

      // If still not found, check schools.admin_email
      if (!schoolRow) {
        const { data: s } = await client
          .from('schools')
          .select('*')
          .eq('admin_email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        if (s) {
          schoolRow = s
          schoolId = s.id
        }
      }
    }

    // 3. If no school row in DB yet (e.g. before migration runs), check campuses or construct from auth user
    if (!schoolRow && userEmail) {
      const { data: campus } = await client
        .from('campuses')
        .select('*')
        .eq('admin_email', userEmail)
        .limit(1)
        .maybeSingle()

      if (campus) {
        const regDate = campus.created_at || new Date().toISOString()
        const trialEnd = new Date(new Date(regDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
        schoolRow = {
          id: campus.id,
          name: campus.name || 'Campus',
          slug: campus.slug || 'campus',
          city: campus.city || 'Karachi',
          admin_email: userEmail,
          owner_name: campus.owner || 'Principal',
          phone: campus.phone || '',
          plan_tier: campus.plan || 'pro',
          plan_status: 'trial',
          created_at: regDate,
          trial_starts_at: regDate,
          trial_ends_at: trialEnd,
          next_billing_date: trialEnd,
          monthly_amount: 5000,
        }
        schoolId = campus.id
      }
    }

    // 4. Default fallback if brand new
    if (!schoolRow) {
      const now = new Date().toISOString()
      const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      schoolRow = {
        id: 'new-school',
        name: 'School Workspace',
        slug: 'school-workspace',
        city: 'Karachi',
        admin_email: userEmail || '',
        owner_name: 'School Admin',
        phone: '',
        plan_tier: 'pro',
        plan_status: 'trial',
        created_at: now,
        trial_starts_at: now,
        trial_ends_at: end,
        next_billing_date: end,
        monthly_amount: 5000,
      }
    }

    const subscription: SchoolSubscription = parseSchoolSubscription(schoolRow)

    // 5. Fetch payment records
    let payments: SubscriptionPaymentRecord[] = []
    if (schoolId && schoolId !== 'new-school') {
      const { data: pList } = await client
        .from('subscription_payments')
        .select('*')
        .eq('school_id', schoolId)
        .order('paid_at', { ascending: false })

      if (pList && Array.isArray(pList)) {
        payments = pList.map((p: any) => ({
          id: p.id,
          schoolId: p.school_id,
          amount: Number(p.amount) || 5000,
          currency: p.currency || 'PKR',
          billingCycle: p.billing_cycle || 'monthly',
          paymentMethod: p.payment_method || 'bank_transfer',
          status: p.status || 'paid',
          paidAt: p.paid_at || p.created_at,
          periodStart: p.period_start || p.created_at,
          periodEnd: p.period_end || p.created_at,
          referenceNo: p.reference_no,
          notes: p.notes,
        }))
      }
    }

    return NextResponse.json({
      success: true,
      subscription,
      payments,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to load subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { schoolId, amount, billingCycle, paymentMethod, referenceNo, notes } = body

    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'schoolId is required' }, { status: 400 })
    }

    const client = getSupabaseAdmin()
    const now = new Date()
    const nowIso = now.toISOString()
    const nextBilling = computeNextBillingDate(now)

    // 1. Fetch current school
    const { data: currentSchool } = await client
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .maybeSingle()

    const firstPaidAt = currentSchool?.first_paid_at || nowIso
    const paidAmount = Number(amount) || 5000

    // 2. Update school record
    const { data: updatedSchool, error: updateErr } = await client
      .from('schools')
      .update({
        plan_status: 'active',
        first_paid_at: firstPaidAt,
        last_paid_at: nowIso,
        next_billing_date: nextBilling,
      })
      .eq('id', schoolId)
      .select()
      .maybeSingle()

    if (updateErr || !updatedSchool) {
      console.warn('Failed to update school row, updating campuses fallback:', updateErr)
      try {
        await client.from('campuses').update({ status: 'Active' }).eq('id', schoolId)
      } catch {}
    }

    // 3. Insert into subscription_payments
    const periodEnd = new Date(now)
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const paymentPayload = {
      school_id: schoolId,
      amount: paidAmount,
      currency: 'PKR',
      billing_cycle: billingCycle || 'monthly',
      payment_method: paymentMethod || 'bank_transfer',
      status: 'paid',
      paid_at: nowIso,
      period_start: nowIso,
      period_end: periodEnd.toISOString(),
      reference_no: referenceNo || `REF-${Date.now()}`,
      notes: notes || 'Subscription fee verified & credited',
    }

    await client.from('subscription_payments').insert([paymentPayload])

    return NextResponse.json({
      success: true,
      subscription: updatedSchool ? parseSchoolSubscription(updatedSchool) : null,
      message: 'Subscription payment recorded. Next billing date scheduled.',
      nextBillingDate: nextBilling,
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to record payment' },
      { status: 500 }
    )
  }
}
