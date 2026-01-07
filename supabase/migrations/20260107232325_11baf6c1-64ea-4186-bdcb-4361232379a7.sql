-- Create pix_transactions table for storing payment data
CREATE TABLE public.pix_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL, -- in cents
  status TEXT NOT NULL DEFAULT 'pending',
  payer_name TEXT NOT NULL,
  payer_email TEXT NOT NULL,
  payer_document TEXT NOT NULL,
  qr_code TEXT,
  qr_code_image TEXT,
  end_to_end_id TEXT,
  tribopay_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.pix_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own transactions"
ON public.pix_transactions
FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

-- Allow insert for authenticated users
CREATE POLICY "Users can create transactions"
ON public.pix_transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow public insert for webhook updates (service role)
CREATE POLICY "Service role can update transactions"
ON public.pix_transactions
FOR UPDATE
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_pix_transactions_updated_at
BEFORE UPDATE ON public.pix_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();