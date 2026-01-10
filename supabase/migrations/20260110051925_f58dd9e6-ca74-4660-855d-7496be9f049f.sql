-- Criar tabela de tokens VIP
CREATE TABLE public.vip_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    token text UNIQUE NOT NULL,
    is_used boolean DEFAULT false,
    used_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.vip_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins can manage all tokens" 
ON public.vip_tokens 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can check token validity" 
ON public.vip_tokens 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can use tokens" 
ON public.vip_tokens 
FOR UPDATE 
USING (is_used = false)
WITH CHECK (auth.uid() = used_by);

-- Gerar 1000 tokens únicos (formato: VIP-XXXX-XXXX-XXXX)
INSERT INTO public.vip_tokens (token)
SELECT 'VIP-' || 
       upper(substring(md5(random()::text) from 1 for 4)) || '-' ||
       upper(substring(md5(random()::text) from 5 for 4)) || '-' ||
       upper(substring(md5(random()::text) from 9 for 4))
FROM generate_series(1, 1000);