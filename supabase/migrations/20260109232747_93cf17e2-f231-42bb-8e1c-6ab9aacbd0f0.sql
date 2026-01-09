
-- CRITICAL SECURITY FIX: Prevent users from modifying their own VIP status
-- Drop the current permissive policy that allows users to update any field
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a more restrictive policy that only allows updating non-VIP fields
-- Users can update their own profile, but NOT is_vip or vip_expires_at fields
-- This is done by checking that VIP fields remain unchanged during update
CREATE POLICY "Users can update own profile safely" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND (
    -- Either no change to VIP fields (comparison with existing row)
    -- We use a subquery to get the current values
    (is_vip = (SELECT p.is_vip FROM profiles p WHERE p.id = auth.uid()))
    AND (vip_expires_at IS NOT DISTINCT FROM (SELECT p.vip_expires_at FROM profiles p WHERE p.id = auth.uid()))
  )
);

-- Note: Admins can still update any field via their separate policy
-- The webhook uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS entirely
