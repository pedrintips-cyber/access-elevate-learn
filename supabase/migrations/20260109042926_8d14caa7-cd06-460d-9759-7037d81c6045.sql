-- Create storage bucket for lesson videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-videos', 
  'lesson-videos', 
  true,
  524288000, -- 500MB limit per file
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/mpeg']
);

-- Policy to allow authenticated users to upload videos (admin only in practice via RLS)
CREATE POLICY "Admins can upload lesson videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Policy to allow public read access to videos
CREATE POLICY "Anyone can view lesson videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'lesson-videos');

-- Policy to allow admins to update videos
CREATE POLICY "Admins can update lesson videos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-videos' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Policy to allow admins to delete videos
CREATE POLICY "Admins can delete lesson videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-videos' 
  AND public.has_role(auth.uid(), 'admin')
);