-- ==============================================================================
-- EduFlow OS: Add Missing Columns Migration for Profiles and Schools
-- ==============================================================================

-- 1. Ensure columns exist on profiles table
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS school_setup_complete BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Ensure columns exist on schools table
ALTER TABLE IF EXISTS public.schools
  ADD COLUMN IF NOT EXISTS admin_email TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'pro',
  ADD COLUMN IF NOT EXISTS plan_status TEXT DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS trial_starts_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMPTZ DEFAULT (now() + interval '30 days'),
  ADD COLUMN IF NOT EXISTS monthly_amount NUMERIC DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS school_setup_complete BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS first_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Create index for performance
CREATE INDEX IF NOT EXISTS idx_schools_admin_email ON public.schools (admin_email);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles (school_id);
