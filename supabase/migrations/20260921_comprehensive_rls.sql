-- ==============================================================================
-- EduFlow OS: Comprehensive Multi-Tenant Row Level Security (RLS) Policies
-- Migration: 20260921_comprehensive_rls.sql
-- Security Architects: Bilal (Security Guardian) & Tariq (Database Specialist)
-- ==============================================================================

-- 1. SECURITY DEFINER HELPER FUNCTIONS (Bypass RLS inside helper to avoid recursion)
CREATE OR REPLACE FUNCTION public.get_auth_school_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    );
$$;

-- 2. ENABLE RLS ON ALL CORE TABLES
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_vouchers ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 3. POLICIES: schools
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "schools_select_policy" ON public.schools;
CREATE POLICY "schools_select_policy" ON public.schools
    FOR SELECT TO authenticated
    USING (
        id = public.get_auth_school_id()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "schools_insert_policy" ON public.schools;
CREATE POLICY "schools_insert_policy" ON public.schools
    FOR INSERT TO authenticated
    WITH CHECK (
        public.is_super_admin()
        OR public.get_auth_school_id() IS NULL
    );

DROP POLICY IF EXISTS "schools_update_policy" ON public.schools;
CREATE POLICY "schools_update_policy" ON public.schools
    FOR UPDATE TO authenticated
    USING (
        (id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "schools_delete_policy" ON public.schools;
CREATE POLICY "schools_delete_policy" ON public.schools
    FOR DELETE TO authenticated
    USING (public.is_super_admin());

-- -----------------------------------------------------------------------------
-- 4. POLICIES: subscription_payments
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "sub_payments_select_policy" ON public.subscription_payments;
CREATE POLICY "sub_payments_select_policy" ON public.subscription_payments
    FOR SELECT TO authenticated
    USING (
        school_id = public.get_auth_school_id()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "sub_payments_insert_policy" ON public.subscription_payments;
CREATE POLICY "sub_payments_insert_policy" ON public.subscription_payments
    FOR INSERT TO authenticated
    WITH CHECK (
        (school_id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "sub_payments_modify_policy" ON public.subscription_payments;
CREATE POLICY "sub_payments_modify_policy" ON public.subscription_payments
    FOR ALL TO authenticated
    USING (public.is_super_admin());

-- -----------------------------------------------------------------------------
-- 5. POLICIES: profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR public.is_super_admin()
        OR (school_id = public.get_auth_school_id() AND public.get_auth_user_role() IN ('school_admin', 'teacher'))
    );

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (
        id = auth.uid()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE TO authenticated
    USING (
        id = auth.uid()
        OR public.is_super_admin()
        OR (school_id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
    );

DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
CREATE POLICY "profiles_delete_policy" ON public.profiles
    FOR DELETE TO authenticated
    USING (public.is_super_admin());

-- -----------------------------------------------------------------------------
-- 6. POLICIES: campuses
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "campuses_select_policy" ON public.campuses;
CREATE POLICY "campuses_select_policy" ON public.campuses
    FOR SELECT TO authenticated
    USING (
        school_id = public.get_auth_school_id()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "campuses_all_policy" ON public.campuses;
CREATE POLICY "campuses_all_policy" ON public.campuses
    FOR ALL TO authenticated
    USING (
        (school_id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
        OR public.is_super_admin()
    );

-- -----------------------------------------------------------------------------
-- 7. POLICIES: students
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "students_select_policy" ON public.students;
CREATE POLICY "students_select_policy" ON public.students
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin()
        OR (school_id = public.get_auth_school_id() AND public.get_auth_user_role() IN ('school_admin', 'teacher'))
        OR parent_id = auth.uid()
        OR guardian_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "students_modify_policy" ON public.students;
CREATE POLICY "students_modify_policy" ON public.students
    FOR ALL TO authenticated
    USING (
        (school_id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
        OR public.is_super_admin()
    );

-- -----------------------------------------------------------------------------
-- 8. POLICIES: teachers
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "teachers_select_policy" ON public.teachers;
CREATE POLICY "teachers_select_policy" ON public.teachers
    FOR SELECT TO authenticated
    USING (
        school_id = public.get_auth_school_id()
        OR public.is_super_admin()
    );

DROP POLICY IF EXISTS "teachers_modify_policy" ON public.teachers;
CREATE POLICY "teachers_modify_policy" ON public.teachers
    FOR ALL TO authenticated
    USING (
        (school_id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
        OR public.is_super_admin()
    );

-- -----------------------------------------------------------------------------
-- 9. POLICIES: attendance
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "attendance_select_policy" ON public.attendance;
CREATE POLICY "attendance_select_policy" ON public.attendance
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin()
        OR (school_id = public.get_auth_school_id() AND public.get_auth_user_role() IN ('school_admin', 'teacher'))
        OR student_id IN (
            SELECT id FROM public.students 
            WHERE parent_id = auth.uid() 
            OR guardian_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "attendance_modify_policy" ON public.attendance;
CREATE POLICY "attendance_modify_policy" ON public.attendance
    FOR ALL TO authenticated
    USING (
        (school_id = public.get_auth_school_id() AND public.get_auth_user_role() IN ('school_admin', 'teacher'))
        OR public.is_super_admin()
    );

-- -----------------------------------------------------------------------------
-- 10. POLICIES: fee_vouchers
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "fee_vouchers_select_policy" ON public.fee_vouchers;
CREATE POLICY "fee_vouchers_select_policy" ON public.fee_vouchers
    FOR SELECT TO authenticated
    USING (
        public.is_super_admin()
        OR (school_id = public.get_auth_school_id() AND public.get_auth_user_role() IN ('school_admin', 'teacher'))
        OR student_id IN (
            SELECT id FROM public.students 
            WHERE parent_id = auth.uid() 
            OR guardian_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        )
    );

DROP POLICY IF EXISTS "fee_vouchers_modify_policy" ON public.fee_vouchers;
CREATE POLICY "fee_vouchers_modify_policy" ON public.fee_vouchers
    FOR ALL TO authenticated
    USING (
        (school_id = public.get_auth_school_id() AND public.get_auth_user_role() = 'school_admin')
        OR public.is_super_admin()
    );
