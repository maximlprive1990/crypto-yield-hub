-- Add referral_code to profiles table
ALTER TABLE public.profiles 
ADD COLUMN referral_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8);

-- Update existing profiles to have unique referral codes
UPDATE public.profiles 
SET referral_code = substring(md5(random()::text || id::text) from 1 for 8)
WHERE referral_code IS NULL;

-- Make referral_code NOT NULL now that all existing records have values
ALTER TABLE public.profiles 
ALTER COLUMN referral_code SET NOT NULL;

-- Add referral tracking fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN referred_by UUID REFERENCES public.profiles(user_id),
ADD COLUMN total_referrals INTEGER DEFAULT 0,
ADD COLUMN total_referral_earnings NUMERIC DEFAULT 0,
ADD COLUMN monthly_referral_earnings NUMERIC DEFAULT 0,
ADD COLUMN loyalty_days INTEGER DEFAULT 0,
ADD COLUMN last_active DATE DEFAULT CURRENT_DATE;

-- Create referrals table to track individual referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.profiles(user_id),
  referred_id UUID NOT NULL REFERENCES public.profiles(user_id),
  referral_code TEXT NOT NULL,
  earnings_generated NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for referrals
CREATE POLICY "Users can view their own referrals"
ON public.referrals 
FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
ON public.referrals 
FOR INSERT 
WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
ON public.referrals 
FOR UPDATE 
USING (auth.uid() = referrer_id);

-- Create trigger for automatic timestamp updates on referrals
CREATE TRIGGER update_referrals_updated_at
BEFORE UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update referral stats when earnings change
CREATE OR REPLACE FUNCTION update_referral_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update referrer's total referrals and earnings
  UPDATE public.profiles 
  SET 
    total_referrals = (
      SELECT COUNT(*) 
      FROM public.referrals 
      WHERE referrer_id = NEW.referrer_id
    ),
    total_referral_earnings = (
      SELECT COALESCE(SUM(earnings_generated), 0) 
      FROM public.referrals 
      WHERE referrer_id = NEW.referrer_id
    ),
    monthly_referral_earnings = (
      SELECT COALESCE(SUM(earnings_generated), 0) 
      FROM public.referrals 
      WHERE referrer_id = NEW.referrer_id 
      AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    )
  WHERE user_id = NEW.referrer_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update stats when referral earnings change
CREATE TRIGGER update_referral_stats_trigger
AFTER INSERT OR UPDATE ON public.referrals
FOR EACH ROW
EXECUTE FUNCTION update_referral_stats();