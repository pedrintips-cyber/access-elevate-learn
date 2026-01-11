-- Corrigir: Links do site devem ser visíveis apenas para usuários autenticados
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Apenas usuários autenticados podem ver configurações do site
CREATE POLICY "Authenticated users can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);