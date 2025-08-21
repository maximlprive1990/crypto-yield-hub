-- Create RPC functions for faucet claims
CREATE OR REPLACE FUNCTION public.get_latest_faucet_claim(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  amount_claimed numeric,
  claimed_at timestamptz,
  next_claim_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, amount_claimed, claimed_at, next_claim_at
  FROM faucet_claims
  WHERE user_id = p_user_id
  ORDER BY claimed_at DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_total_faucet_claims(p_user_id uuid)
RETURNS numeric
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(amount_claimed), 0)
  FROM faucet_claims
  WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION public.create_faucet_claim(
  p_user_id uuid,
  p_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_next_claim timestamptz;
  v_current_balance numeric;
  v_claim_id uuid;
BEGIN
  -- Calculate next claim time (15 minutes from now)
  v_next_claim := now() + interval '15 minutes';
  
  -- Insert faucet claim
  INSERT INTO faucet_claims (user_id, amount_claimed, claimed_at, next_claim_at)
  VALUES (p_user_id, p_amount, now(), v_next_claim)
  RETURNING id INTO v_claim_id;
  
  -- Get current balance
  SELECT COALESCE(deadspot_tokens, 0) INTO v_current_balance
  FROM profiles
  WHERE user_id = p_user_id;
  
  -- Update user's deadspot tokens
  UPDATE profiles
  SET deadspot_tokens = v_current_balance + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN json_build_object(
    'success', true,
    'claim_id', v_claim_id,
    'next_claim_at', v_next_claim,
    'amount', p_amount
  );
END;
$$;