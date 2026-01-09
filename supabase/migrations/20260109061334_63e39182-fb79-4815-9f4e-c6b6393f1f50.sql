-- Remover política duplicada/antiga que ainda permite user_id IS NULL
DROP POLICY IF EXISTS "Users can view own transactions" ON pix_transactions;

-- Atualizar política de criação para não permitir user_id NULL
DROP POLICY IF EXISTS "Users can create transactions" ON pix_transactions;
CREATE POLICY "Authenticated users can create transactions"
ON pix_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);