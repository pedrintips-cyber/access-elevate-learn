-- Add related_links column to lessons table for storing links to tools and other lessons
ALTER TABLE public.lessons 
ADD COLUMN related_links jsonb DEFAULT '[]'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN public.lessons.related_links IS 'Array of related links: [{type: "tool"|"lesson", id: "uuid", label: "optional custom label"}]';