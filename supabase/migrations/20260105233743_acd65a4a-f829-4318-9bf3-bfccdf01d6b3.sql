-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'Pedro Tips',
  site_description TEXT DEFAULT 'Plataforma de cursos',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.site_settings (site_name, site_description) VALUES ('Pedro Tips', 'Plataforma de cursos online');

-- Function to assign admin role by email
CREATE OR REPLACE FUNCTION public.assign_admin_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Assign admin role if email matches
  IF NEW.email = 'pedrintips@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  
  -- Always assign user role
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to assign roles on user creation
CREATE TRIGGER on_auth_user_created_assign_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_admin_on_signup();

-- Update profiles RLS to allow admins to view all
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.has_role(auth.uid(), 'admin'));

-- Allow admins to update any profile (for VIP management)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage categories
CREATE POLICY "Admins can insert categories"
ON public.categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update categories"
ON public.categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete categories"
ON public.categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage lessons
CREATE POLICY "Admins can insert lessons"
ON public.lessons FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update lessons"
ON public.lessons FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete lessons"
ON public.lessons FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all lessons (including unpublished)
CREATE POLICY "Admins can view all lessons"
ON public.lessons FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to manage tools
CREATE POLICY "Admins can insert tools"
ON public.tools FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update tools"
ON public.tools FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete tools"
ON public.tools FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can view all tools
CREATE POLICY "Admins can view all tools"
ON public.tools FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));