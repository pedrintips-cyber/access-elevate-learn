-- CORREÇÃO DE SEGURANÇA: Dados de pagamento PIX
-- Remover política pública perigosa
DROP POLICY IF EXISTS "Anyone can view transactions by external_id" ON pix_transactions;

-- Criar política segura para usuários verem apenas suas transações
CREATE POLICY "Users can only view own transactions"
ON pix_transactions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins podem ver todas as transações
CREATE POLICY "Admins can view all transactions"
ON pix_transactions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role para webhooks (edge functions usam service role)
-- Não precisa de política específica pois service role bypassa RLS

-- CORREÇÃO DE SEGURANÇA: Feedbacks
-- Remover política pública
DROP POLICY IF EXISTS "Anyone can view feedbacks" ON feedbacks;

-- Usuários veem apenas seus próprios feedbacks
CREATE POLICY "Users can view own feedbacks"
ON feedbacks
FOR SELECT
USING (auth.uid() = user_id);

-- Admins já têm política ALL, então não precisa adicionar

-- CORREÇÃO: Melhorar política de perfis
-- A política atual já está ok (usuário vê próprio + admin vê todos)
-- Vamos garantir que está correta
DROP POLICY IF EXISTS "Users can view own profile or admin can view all" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- ADICIONAR: Admin pode ver progresso dos alunos
CREATE POLICY "Admins can view all lesson progress"
ON lesson_progress
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));