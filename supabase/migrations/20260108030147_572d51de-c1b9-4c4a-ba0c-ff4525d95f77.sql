-- Adiciona coluna de instruções na tabela tools
ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS instructions TEXT;