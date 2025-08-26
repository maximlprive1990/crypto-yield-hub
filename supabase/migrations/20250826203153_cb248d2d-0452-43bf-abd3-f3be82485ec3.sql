
-- Créer une table pour les positions de staking
CREATE TABLE public.staking_positions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  crypto_type TEXT NOT NULL DEFAULT 'TON',
  amount_staked NUMERIC NOT NULL DEFAULT 0,
  apy NUMERIC NOT NULL DEFAULT 5.0,
  duration_days INTEGER DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  wallet_address TEXT NOT NULL,
  memo TEXT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  total_rewards NUMERIC NOT NULL DEFAULT 0,
  last_reward_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ajouter RLS
ALTER TABLE public.staking_positions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own staking positions" 
  ON public.staking_positions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own staking positions" 
  ON public.staking_positions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own staking positions" 
  ON public.staking_positions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Mettre à jour la table deposits pour supporter la vérification par ID de transaction
ALTER TABLE public.deposits 
ADD COLUMN IF NOT EXISTS memo TEXT;

-- Fonction pour vérifier un dépôt par ID de transaction
CREATE OR REPLACE FUNCTION public.verify_deposit_by_txid(
  p_user_id UUID,
  p_transaction_id TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_deposit_id UUID;
  v_amount NUMERIC;
  v_crypto_type TEXT;
BEGIN
  -- Vérifier si le dépôt existe et lui appartient
  SELECT id, amount, crypto_type INTO v_deposit_id, v_amount, v_crypto_type
  FROM public.deposits
  WHERE user_id = p_user_id 
    AND transaction_id = p_transaction_id
    AND status = 'pending';
  
  IF v_deposit_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Aucun dépôt en attente trouvé avec cet ID de transaction'
    );
  END IF;
  
  -- Marquer le dépôt comme vérifié
  UPDATE public.deposits
  SET status = 'verified',
      verified_at = now(),
      updated_at = now()
  WHERE id = v_deposit_id;
  
  -- Activer la position de staking correspondante si elle existe
  UPDATE public.staking_positions
  SET status = 'active',
      updated_at = now()
  WHERE user_id = p_user_id 
    AND crypto_type = v_crypto_type
    AND amount_staked = v_amount
    AND status = 'pending';
  
  RETURN json_build_object(
    'success', true,
    'message', 'Dépôt vérifié avec succès',
    'amount', v_amount,
    'crypto_type', v_crypto_type
  );
END;
$$;
