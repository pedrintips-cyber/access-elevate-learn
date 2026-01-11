-- CORREÇÃO DE SEGURANÇA: Proteger tokens VIP

-- Remover a política pública que expõe todos os tokens
DROP POLICY IF EXISTS "Anyone can check token validity" ON public.vip_tokens;

-- Criar função segura para validar token (não expõe a lista completa)
CREATE OR REPLACE FUNCTION public.validate_vip_token(token_input TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  token_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN t.id IS NOT NULL AND t.is_used = false THEN true ELSE false END as is_valid,
    t.id as token_id
  FROM vip_tokens t
  WHERE t.token = UPPER(TRIM(token_input))
  LIMIT 1;
END;
$$;

-- Criar função para usar token de forma segura
CREATE OR REPLACE FUNCTION public.use_vip_token(token_input TEXT, user_id_input UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token_id UUID;
  v_is_used BOOLEAN;
BEGIN
  -- Buscar o token
  SELECT id, is_used INTO v_token_id, v_is_used
  FROM vip_tokens
  WHERE token = UPPER(TRIM(token_input));
  
  -- Verificações
  IF v_token_id IS NULL THEN
    RETURN QUERY SELECT false, 'Token não encontrado'::TEXT;
    RETURN;
  END IF;
  
  IF v_is_used THEN
    RETURN QUERY SELECT false, 'Token já foi utilizado'::TEXT;
    RETURN;
  END IF;
  
  -- Marcar token como usado
  UPDATE vip_tokens
  SET is_used = true, used_by = user_id_input, used_at = now()
  WHERE id = v_token_id AND is_used = false;
  
  -- Ativar VIP do usuário (30 dias)
  UPDATE profiles
  SET is_vip = true, vip_expires_at = now() + interval '30 days'
  WHERE id = user_id_input;
  
  RETURN QUERY SELECT true, 'VIP ativado com sucesso!'::TEXT;
END;
$$;

-- Política apenas para admins verem tokens
CREATE POLICY "Only admins can view tokens" 
ON public.vip_tokens 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Remover política de UPDATE pública
DROP POLICY IF EXISTS "Authenticated users can use tokens" ON public.vip_tokens;

-- Apenas admins podem manipular tokens diretamente
CREATE POLICY "Only admins can update tokens" 
ON public.vip_tokens 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can insert tokens" 
ON public.vip_tokens 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete tokens" 
ON public.vip_tokens 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));