-- Create table to track roulette spins
CREATE TABLE public.roulette_spins (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.pix_transactions(id),
    amount INTEGER NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'lose')),
    vip_days_won INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roulette_spins ENABLE ROW LEVEL SECURITY;

-- Users can view their own spins
CREATE POLICY "Users can view own spins" 
ON public.roulette_spins 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own spins (after payment)
CREATE POLICY "Users can insert own spins" 
ON public.roulette_spins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all spins
CREATE POLICY "Admins can view all spins" 
ON public.roulette_spins 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));