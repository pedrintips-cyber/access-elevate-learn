-- Adicionar coluna parent_id para subcategorias
ALTER TABLE public.categories 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE;

-- Criar índice para melhor performance nas consultas
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Comentário para documentar a estrutura
COMMENT ON COLUMN public.categories.parent_id IS 'ID da categoria pai. NULL para categorias principais, preenchido para subcategorias.';