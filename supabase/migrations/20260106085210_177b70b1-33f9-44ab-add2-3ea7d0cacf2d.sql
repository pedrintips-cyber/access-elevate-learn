-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create posts table for VIP social feed
CREATE TABLE public.posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table
CREATE TABLE public.post_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(post_id, user_id)
);

-- Create post_comments table
CREATE TABLE public.post_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedbacks table
CREATE TABLE public.feedbacks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'suggestion',
    status TEXT NOT NULL DEFAULT 'pending',
    admin_response TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Posts RLS Policies
CREATE POLICY "Anyone can view posts"
ON public.posts FOR SELECT
USING (true);

CREATE POLICY "VIP users can create posts"
ON public.posts FOR INSERT
WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND is_vip = true 
        AND (vip_expires_at IS NULL OR vip_expires_at > now())
    )
);

CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
ON public.posts FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all posts"
ON public.posts FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Post Likes RLS Policies
CREATE POLICY "Anyone can view likes"
ON public.post_likes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can like"
ON public.post_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own likes"
ON public.post_likes FOR DELETE
USING (auth.uid() = user_id);

-- Post Comments RLS Policies
CREATE POLICY "Anyone can view comments"
ON public.post_comments FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can comment"
ON public.post_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON public.post_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
ON public.post_comments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Feedbacks RLS Policies
CREATE POLICY "Anyone can view feedbacks"
ON public.feedbacks FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create feedback"
ON public.feedbacks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedback"
ON public.feedbacks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own feedback"
ON public.feedbacks FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all feedbacks"
ON public.feedbacks FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for posts and comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_comments;

-- Trigger for updating updated_at
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feedbacks_updated_at
BEFORE UPDATE ON public.feedbacks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();