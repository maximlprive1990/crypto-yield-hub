-- Create table for ZERO cryptocurrency withdrawals
CREATE TABLE public.zero_withdrawals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  processing_time_hours INTEGER NOT NULL DEFAULT 12 CHECK (processing_time_hours >= 2 AND processing_time_hours <= 24),
  estimated_completion TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.zero_withdrawals ENABLE ROW LEVEL SECURITY;

-- Create policies for zero withdrawals
CREATE POLICY "Users can create their own ZERO withdrawals" 
ON public.zero_withdrawals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own ZERO withdrawals" 
ON public.zero_withdrawals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own ZERO withdrawals" 
ON public.zero_withdrawals 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_zero_withdrawals_updated_at
BEFORE UPDATE ON public.zero_withdrawals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();