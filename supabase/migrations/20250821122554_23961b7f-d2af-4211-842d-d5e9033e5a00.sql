-- Create faucet_claims table for ZERO token claims
CREATE TABLE public.faucet_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_claimed NUMERIC NOT NULL DEFAULT 0,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_claim_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.faucet_claims ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own faucet claims" 
ON public.faucet_claims 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own faucet claims" 
ON public.faucet_claims 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own faucet claims" 
ON public.faucet_claims 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to increment deadspot tokens
CREATE OR REPLACE FUNCTION public.increment_deadspot(amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN amount;
END;
$$;