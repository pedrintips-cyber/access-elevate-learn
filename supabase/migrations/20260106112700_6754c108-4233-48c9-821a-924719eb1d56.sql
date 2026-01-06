-- Add is_approved column to posts table for moderation
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_approved boolean DEFAULT false;

-- Add whatsapp_link and discord_link columns to site_settings
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS whatsapp_link text;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS discord_link text;

-- Update RLS policy for posts - only show approved posts to non-admins
DROP POLICY IF EXISTS "Anyone can view posts" ON public.posts;

CREATE POLICY "Anyone can view approved posts" 
ON public.posts 
FOR SELECT 
USING (is_approved = true OR has_role(auth.uid(), 'admin'::app_role));