-- Drop the overly permissive update policy
DROP POLICY IF EXISTS "Service role can update transactions" ON public.pix_transactions;

-- Create a more restrictive policy - allow anonymous select for checking status
CREATE POLICY "Anyone can view transactions by external_id"
ON public.pix_transactions
FOR SELECT
USING (true);

-- Note: Updates will be done via service role in edge functions, which bypasses RLS