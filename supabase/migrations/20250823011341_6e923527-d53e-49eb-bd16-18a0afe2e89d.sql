
-- 1) Table pour stocker les statistiques du jeu "Click to Earn"
CREATE TABLE IF NOT EXISTS public.click_to_earn_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  total_clicks integer NOT NULL DEFAULT 0,
  total_zero_earned numeric NOT NULL DEFAULT 0,
  free_spins_earned integer NOT NULL DEFAULT 0,
  free_spins_used integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT click_to_earn_stats_user_unique UNIQUE (user_id)
);

-- 2) RLS
ALTER TABLE public.click_to_earn_stats ENABLE ROW LEVEL SECURITY;

-- Policies: l'utilisateur peut lire/écrire seulement ses propres données
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'click_to_earn_stats' 
      AND policyname = 'Users can view their own click stats'
  ) THEN
    CREATE POLICY "Users can view their own click stats"
      ON public.click_to_earn_stats
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'click_to_earn_stats' 
      AND policyname = 'Users can create their own click stats'
  ) THEN
    CREATE POLICY "Users can create their own click stats"
      ON public.click_to_earn_stats
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'click_to_earn_stats' 
      AND policyname = 'Users can update their own click stats'
  ) THEN
    CREATE POLICY "Users can update their own click stats"
      ON public.click_to_earn_stats
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 3) Trigger pour updated_at (réutilise la fonction existante public.update_updated_at_column)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at_click_to_earn_stats'
  ) THEN
    CREATE TRIGGER set_updated_at_click_to_earn_stats
    BEFORE UPDATE ON public.click_to_earn_stats
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END
$$;
