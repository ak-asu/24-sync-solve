-- ============================================================
-- WIAL Platform - Promote temp user to super admin
-- File: supabase/seeds/set_temp_admin.sql
-- ============================================================

BEGIN;

UPDATE profiles p
SET role = 'super_admin'::user_role,
    full_name = COALESCE(NULLIF(p.full_name, ''), 'WIAL Platform Admin')
WHERE p.email = 'temp@gmail.com'
   OR p.id::text = 'b0e42634-842a-4f90-93f7-517c7b01470c';

COMMIT;

-- Optional check:
-- SELECT id, email, role, full_name FROM profiles WHERE email = 'temp@gmail.com';
