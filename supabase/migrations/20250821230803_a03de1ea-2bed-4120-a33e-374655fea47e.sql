-- Fix security warnings: Set search_path for functions to prevent search path attacks

-- Update the new function with proper search_path
CREATE OR REPLACE FUNCTION public.get_public_chat_messages()
RETURNS TABLE(
  id uuid,
  username text,
  message text,
  created_at timestamp with time zone,
  is_own_message boolean
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT 
    cm.id,
    cm.username,
    cm.message,
    cm.created_at,
    CASE WHEN cm.user_id = auth.uid() THEN true ELSE false END as is_own_message
  FROM public.chat_messages cm
  ORDER BY cm.created_at ASC;
$$;

-- Update existing functions to include search_path for security
CREATE OR REPLACE FUNCTION public.increment_deadspot(amount numeric)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN amount;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_latest_faucet_claim(p_user_id uuid)
 RETURNS TABLE(id uuid, user_id uuid, amount_claimed numeric, claimed_at timestamp with time zone, next_claim_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT id, user_id, amount_claimed, claimed_at, next_claim_at
  FROM faucet_claims
  WHERE user_id = p_user_id
  ORDER BY claimed_at DESC
  LIMIT 1;
$function$;

CREATE OR REPLACE FUNCTION public.get_total_faucet_claims(p_user_id uuid)
 RETURNS numeric
 LANGUAGE sql
 SECURITY DEFINER
 STABLE
 SET search_path = 'public'
AS $function$
  SELECT COALESCE(SUM(amount_claimed), 0)
  FROM faucet_claims
  WHERE user_id = p_user_id;
$function$;