-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Storage policies for post images
CREATE POLICY "Anyone can view post images"
ON storage.objects FOR SELECT
USING (bucket_id = 'post-images');

CREATE POLICY "VIP users can upload post images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND is_vip = true 
    AND (vip_expires_at IS NULL OR vip_expires_at > now())
  )
);

CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);