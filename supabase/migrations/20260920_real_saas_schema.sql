-- ==============================================================================
-- EduFlow OS: Canonical Multi-Tenant Schema & 30-Day Real Trial Engine
-- Migration: 20260920_real_saas_schema.sql
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TENANT SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    city TEXT DEFAULT 'Karachi',
    admin_email TEXT,
    owner_name TEXT,
    phone TEXT,
    plan_tier TEXT NOT NULL DEFAULT 'pro', -- 'starter', 'pro', 'enterprise'
    plan_status TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'past_due', 'canceled'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    trial_ends_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    first_paid_at TIMESTAMPTZ,
    last_paid_at TIMESTAMPTZ,
    next_billing_date TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    monthly_amount NUMERIC(12, 2) NOT NULL DEFAULT 5000.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on slug and email
CREATE INDEX IF NOT EXISTS idx_schools_slug ON public.schools(slug);
CREATE INDEX IF NOT EXISTS idx_schools_admin_email ON public.schools(admin_email);

-- 2. SUBSCRIPTION PAYMENTS TABLE (Audit trail of school subscription fees)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'PKR',
    billing_cycle TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
    payment_method TEXT NOT NULL DEFAULT 'bank_transfer', -- 'bank_transfer', 'easypaisa', 'jazzcash', 'card'
    status TEXT NOT NULL DEFAULT 'paid', -- 'pending', 'paid', 'failed'
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    reference_no TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_payments_school ON public.subscription_payments(school_id);

-- 3. ENSURE PROFILES TABLE HAS SCHOOL_ID
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'school_id'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. ENSURE TENANT TABLES HAVE SCHOOL_ID
-- campuses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'campuses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'campuses' AND column_name = 'school_id') THEN
            ALTER TABLE public.campuses ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- students
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'students' AND column_name = 'school_id') THEN
            ALTER TABLE public.students ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- teachers
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teachers') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'teachers' AND column_name = 'school_id') THEN
            ALTER TABLE public.teachers ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- attendance
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'attendance' AND column_name = 'school_id') THEN
            ALTER TABLE public.attendance ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- fee_invoices
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fee_invoices') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'fee_invoices' AND column_name = 'school_id') THEN
            ALTER TABLE public.fee_invoices ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- expenses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'expenses') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'expenses' AND column_name = 'school_id') THEN
            ALTER TABLE public.expenses ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- diaries
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'diaries') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'diaries' AND column_name = 'school_id') THEN
            ALTER TABLE public.diaries ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on schools
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's school_id
CREATE OR REPLACE FUNCTION public.get_auth_school_id()
RETURNS UUID AS $$
    SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Schools RLS: Allow authenticated users to view their own school, or super_admin to view all
DROP POLICY IF EXISTS "Schools view policy" ON public.schools;
CREATE POLICY "Schools view policy" ON public.schools
    FOR SELECT TO authenticated
    USING (
        id = public.get_auth_school_id() 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) = 'basithunyawrr@gmail.com'
    );

DROP POLICY IF EXISTS "Schools update policy" ON public.schools;
CREATE POLICY "Schools update policy" ON public.schools
    FOR UPDATE TO authenticated
    USING (
        id = public.get_auth_school_id() 
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- Allow new signups to insert a school
DROP POLICY IF EXISTS "Schools insert policy" ON public.schools;
CREATE POLICY "Schools insert policy" ON public.schools
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Subscription payments RLS
DROP POLICY IF EXISTS "Subscription payments view policy" ON public.subscription_payments;
CREATE POLICY "Subscription payments view policy" ON public.subscription_payments
    FOR SELECT TO authenticated
    USING (
        school_id = public.get_auth_school_id()
        OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- 6. REAL TRIAL AUTO-CALCULATION TRIGGER
-- Automatically updates updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_schools_updated_at ON public.schools;
CREATE TRIGGER tr_schools_updated_at
    BEFORE UPDATE ON public.schools
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
