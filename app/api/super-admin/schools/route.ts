import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, city, phone, owner, email, password, plan } = body

    if (!name || !owner || !email) {
      return NextResponse.json(
        { error: 'School name, administrator name, and email are required.' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mtchdghzlkiemwtzyduo.supabase.co'
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_KmiVb1kw1LiOskGkpDkLpw_gapmgN09'
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    // Use admin client if service role key exists, otherwise anon client
    const clientToUse = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : createClient(supabaseUrl, anonKey)

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 24) || 'school-campus'

    // 1. Insert School into public.schools
    const { data: schoolData, error: schoolError } = await clientToUse
      .from('schools')
      .insert([
        {
          name: name.trim(),
          city: city || 'Karachi',
          phone: phone ? phone.trim() : null,
          slug,
        },
      ])
      .select()
      .single()

    if (schoolError) {
      return NextResponse.json(
        {
          error: `Failed to insert school into Supabase: ${schoolError.message}`,
          code: schoolError.code,
        },
        { status: 500 }
      )
    }

    const schoolId = schoolData.id
    let authUser: any = null
    let authNotice = ''

    // 2. Provision Admin Account in Supabase Auth
    if (password && email) {
      const cleanEmail = email.trim().toLowerCase()

      if (serviceRoleKey) {
        const { data: createdUser, error: createError } = await clientToUse.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: owner.trim(),
            role: 'school_admin',
            school_id: schoolId,
            school_name: name.trim(),
            plan: plan || 'Pro',
          },
        })

        if (!createError && createdUser?.user) {
          authUser = createdUser.user
        } else if (createError) {
          authNotice = `Auth provision notice: ${createError.message}`
        }
      } else {
        // Attempt public signUp
        const { data: signData, error: signError } = await clientToUse.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: owner.trim(),
              role: 'school_admin',
              school_id: schoolId,
              school_name: name.trim(),
            },
          },
        })

        if (!signError && signData?.user) {
          authUser = signData.user
        } else if (signError) {
          authNotice = signError.message.includes('signup_disabled')
            ? 'School registered in database. To enable automatic user creation, provide SUPABASE_SERVICE_ROLE_KEY in .env.local or enable user signups in your Supabase Auth dashboard.'
            : `User auth creation notice: ${signError.message}`
        }
      }
    }

    // 3. Insert / Upsert Profile in public.profiles if user ID exists
    if (authUser?.id) {
      try {
        await clientToUse.from('profiles').upsert([
          {
            id: authUser.id,
            full_name: owner.trim(),
            role: 'school_admin',
            school_id: schoolId,
            phone_number: phone ? phone.trim() : null,
            onboarding_completed: true,
          },
        ])
      } catch (profileErr: any) {
        console.warn('Profile upsert warning:', profileErr?.message)
      }
    }

    return NextResponse.json({
      success: true,
      school: schoolData,
      userId: authUser?.id || null,
      message: authNotice || 'School campus and administrator credentials provisioned successfully.',
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Internal server error while provisioning school' },
      { status: 500 }
    )
  }
}
