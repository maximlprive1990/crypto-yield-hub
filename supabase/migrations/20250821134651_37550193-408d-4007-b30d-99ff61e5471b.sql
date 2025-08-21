-- Améliorer le système de parrainage existant

-- Créer une fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un code aléatoire de 8 caractères
    new_code := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(
      SELECT 1 FROM public.profiles WHERE referral_code = new_code
    ) INTO code_exists;
    
    -- Si le code n'existe pas, on peut l'utiliser
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Fonction pour traiter un parrainage
CREATE OR REPLACE FUNCTION public.process_referral(
  p_referrer_code TEXT,
  p_referred_user_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_referrer_id UUID;
  v_referral_id UUID;
  v_referrer_bonus NUMERIC := 10.0; -- 10 DeadSpot tokens pour le parrain
  v_referred_bonus NUMERIC := 5.0;  -- 5 DeadSpot tokens pour le référé
BEGIN
  -- Vérifier que l'utilisateur référé existe et n'a pas déjà un parrain
  IF EXISTS(SELECT 1 FROM public.profiles WHERE user_id = p_referred_user_id AND referred_by IS NOT NULL) THEN
    RETURN json_build_object('success', false, 'message', 'Utilisateur déjà référé');
  END IF;

  -- Trouver le parrain par son code
  SELECT user_id INTO v_referrer_id 
  FROM public.profiles 
  WHERE referral_code = p_referrer_code;
  
  IF v_referrer_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Code de parrainage invalide');
  END IF;
  
  -- Vérifier qu'un utilisateur ne se parraine pas lui-même
  IF v_referrer_id = p_referred_user_id THEN
    RETURN json_build_object('success', false, 'message', 'Impossible de se parrainer soi-même');
  END IF;
  
  -- Créer l'entrée de parrainage
  INSERT INTO public.referrals (
    referrer_id,
    referred_id,
    referral_code,
    earnings_generated,
    created_at
  ) VALUES (
    v_referrer_id,
    p_referred_user_id,
    p_referrer_code,
    v_referrer_bonus,
    now()
  ) RETURNING id INTO v_referral_id;
  
  -- Mettre à jour le profil du référé
  UPDATE public.profiles 
  SET referred_by = v_referrer_id,
      deadspot_tokens = COALESCE(deadspot_tokens, 0) + v_referred_bonus,
      updated_at = now()
  WHERE user_id = p_referred_user_id;
  
  -- Mettre à jour le profil du parrain
  UPDATE public.profiles 
  SET deadspot_tokens = COALESCE(deadspot_tokens, 0) + v_referrer_bonus,
      updated_at = now()
  WHERE user_id = v_referrer_id;
  
  -- Mettre à jour les statistiques (le trigger existant se chargera du reste)
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Parrainage traité avec succès',
    'referrer_bonus', v_referrer_bonus,
    'referred_bonus', v_referred_bonus
  );
END;
$$;

-- Fonction pour obtenir les statistiques de parrainage d'un utilisateur
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'referral_code', p.referral_code,
    'total_referrals', COALESCE(p.total_referrals, 0),
    'total_earnings', COALESCE(p.total_referral_earnings, 0),
    'monthly_earnings', COALESCE(p.monthly_referral_earnings, 0),
    'recent_referrals', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', r.id,
          'referred_user', ref_profile.username,
          'earnings', r.earnings_generated,
          'created_at', r.created_at
        ) ORDER BY r.created_at DESC
      ), '[]'::json)
      FROM public.referrals r
      LEFT JOIN public.profiles ref_profile ON ref_profile.user_id = r.referred_id
      WHERE r.referrer_id = p_user_id
      LIMIT 10
    )
  ) INTO v_stats
  FROM public.profiles p
  WHERE p.user_id = p_user_id;
  
  RETURN v_stats;
END;
$$;

-- Améliorer le trigger de mise à jour des statistiques de parrainage
CREATE OR REPLACE FUNCTION public.update_referral_stats()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mettre à jour les statistiques du parrain
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
    ),
    updated_at = now()
  WHERE user_id = NEW.referrer_id;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger si il n'existe pas déjà
DROP TRIGGER IF EXISTS trigger_update_referral_stats ON public.referrals;
CREATE TRIGGER trigger_update_referral_stats
  AFTER INSERT OR UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_referral_stats();

-- Assurer qu'un code de parrainage unique existe pour tous les profils existants
UPDATE public.profiles 
SET referral_code = public.generate_referral_code(),
    updated_at = now()
WHERE referral_code IS NULL OR referral_code = '';

-- Modifier le trigger handle_new_user pour inclure un code de parrainage
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username, referral_code)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'username',
    public.generate_referral_code()
  );
  RETURN NEW;
END;
$$;