-- Create VIP accounts table
CREATE TABLE public.vip_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier TEXT NOT NULL DEFAULT 'bronze',
  deposit_amount NUMERIC NOT NULL DEFAULT 0,
  transaction_id TEXT,
  payeer_account TEXT DEFAULT 'P1112145219',
  status TEXT NOT NULL DEFAULT 'pending',
  bonus_mining_rate NUMERIC DEFAULT 0,
  bonus_staking_apy NUMERIC DEFAULT 0,
  bonus_click_multiplier NUMERIC DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Battle Pass table
CREATE TABLE public.battle_passes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  season_name TEXT NOT NULL,
  tier TEXT NOT NULL DEFAULT 'free',
  level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_purchased_at TIMESTAMP WITH TIME ZONE,
  rewards_claimed JSONB DEFAULT '[]',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create DeadSpot coin purchases table
CREATE TABLE public.coin_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount_usd NUMERIC NOT NULL,
  amount_deadspot NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL DEFAULT 0.65,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_id TEXT,
  payeer_account TEXT DEFAULT 'P1112145219',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vip_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_passes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_purchases ENABLE ROW LEVEL SECURITY;

-- RLS policies for vip_accounts
CREATE POLICY "Users can view their own VIP account" ON public.vip_accounts
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own VIP account" ON public.vip_accounts
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own VIP account" ON public.vip_accounts
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for battle_passes
CREATE POLICY "Users can view their own battle pass" ON public.battle_passes
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own battle pass" ON public.battle_passes
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own battle pass" ON public.battle_passes
FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for coin_purchases
CREATE POLICY "Users can view their own coin purchases" ON public.coin_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coin purchases" ON public.coin_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coin purchases" ON public.coin_purchases
FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_vip_accounts_updated_at
  BEFORE UPDATE ON public.vip_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_battle_passes_updated_at
  BEFORE UPDATE ON public.battle_passes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coin_purchases_updated_at
  BEFORE UPDATE ON public.coin_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();