-- Create table for spin wheel transactions
CREATE TABLE public.spin_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  amount_paid NUMERIC NOT NULL DEFAULT 0.10,
  currency_paid TEXT NOT NULL,
  payeer_account TEXT NOT NULL DEFAULT 'P1112145219',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  spins_purchased INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verified_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for spin wheel results
CREATE TABLE public.spin_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prize_type TEXT NOT NULL, -- 'zero', 'usdt', 'dogecoin'
  prize_amount NUMERIC NOT NULL,
  is_free_spin BOOLEAN NOT NULL DEFAULT true,
  transaction_id UUID REFERENCES public.spin_transactions(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for user spin status
CREATE TABLE public.user_spin_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  last_free_spin TIMESTAMP WITH TIME ZONE,
  total_spins INTEGER NOT NULL DEFAULT 0,
  purchased_spins INTEGER NOT NULL DEFAULT 0,
  total_zero_won NUMERIC NOT NULL DEFAULT 0,
  total_usdt_won NUMERIC NOT NULL DEFAULT 0,
  total_dogecoin_won NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.spin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_spin_status ENABLE ROW LEVEL SECURITY;

-- Create policies for spin_transactions
CREATE POLICY "Users can create their own spin transactions" 
ON public.spin_transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own spin transactions" 
ON public.spin_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own spin transactions" 
ON public.spin_transactions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for spin_results
CREATE POLICY "Users can create their own spin results" 
ON public.spin_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own spin results" 
ON public.spin_results 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create policies for user_spin_status
CREATE POLICY "Users can create their own spin status" 
ON public.user_spin_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own spin status" 
ON public.user_spin_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own spin status" 
ON public.user_spin_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_spin_transactions_updated_at
BEFORE UPDATE ON public.spin_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_spin_status_updated_at
BEFORE UPDATE ON public.user_spin_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();