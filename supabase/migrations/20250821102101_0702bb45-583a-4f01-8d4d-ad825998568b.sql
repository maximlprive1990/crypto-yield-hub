-- Create missions/quests system
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  mission_type TEXT NOT NULL CHECK (mission_type IN ('mining', 'staking', 'referral', 'login', 'experience')),
  target_amount NUMERIC NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('deadspot', 'experience', 'powerup', 'lootbox')),
  reward_amount NUMERIC NOT NULL,
  duration_hours INTEGER DEFAULT 24,
  is_daily BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user missions tracking
CREATE TABLE public.user_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  mission_id UUID NOT NULL REFERENCES public.missions(id),
  current_progress NUMERIC DEFAULT 0,
  target_amount NUMERIC NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  is_claimed BOOLEAN DEFAULT false,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  UNIQUE(user_id, mission_id, started_at::date)
);

-- Create leaderboards table
CREATE TABLE public.leaderboard_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  leaderboard_type TEXT NOT NULL CHECK (leaderboard_type IN ('mining_daily', 'mining_weekly', 'mining_monthly', 'staking_total', 'experience', 'referrals')),
  score NUMERIC NOT NULL DEFAULT 0,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  rank_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, leaderboard_type, period_start)
);

-- Create loot boxes system
CREATE TABLE public.loot_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_deadspot NUMERIC NOT NULL,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_available BOOLEAN DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loot box rewards
CREATE TABLE public.loot_box_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  loot_box_id UUID NOT NULL REFERENCES public.loot_boxes(id),
  reward_type TEXT NOT NULL CHECK (reward_type IN ('deadspot', 'experience', 'powerup', 'skin', 'multiplier')),
  reward_name TEXT NOT NULL,
  reward_amount NUMERIC NOT NULL,
  drop_chance NUMERIC NOT NULL CHECK (drop_chance >= 0 AND drop_chance <= 100),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user loot box openings
CREATE TABLE public.user_loot_box_openings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  loot_box_id UUID NOT NULL REFERENCES public.loot_boxes(id),
  reward_id UUID NOT NULL REFERENCES public.loot_box_rewards(id),
  opened_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events system
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('double_xp', 'bonus_mining', 'special_crypto', 'increased_drops')),
  multiplier NUMERIC DEFAULT 2.0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create skins/customization system
CREATE TABLE public.skins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  skin_type TEXT NOT NULL CHECK (skin_type IN ('avatar', 'mining_farm', 'ui_theme')),
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  cost_deadspot NUMERIC DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  image_url TEXT,
  unlocked_by TEXT CHECK (unlocked_by IN ('purchase', 'achievement', 'lootbox', 'event')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user skins ownership
CREATE TABLE public.user_skins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id),
  skin_id UUID NOT NULL REFERENCES public.skins(id),
  is_equipped BOOLEAN DEFAULT false,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, skin_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_box_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_loot_box_openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for missions (public read, no user-specific data)
CREATE POLICY "Missions are viewable by everyone"
ON public.missions FOR SELECT USING (true);

-- RLS Policies for user_missions
CREATE POLICY "Users can view their own missions"
ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own missions"
ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own missions"
ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for leaderboards (public read)
CREATE POLICY "Leaderboards are viewable by everyone"
ON public.leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can update their own leaderboard entries"
ON public.leaderboard_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leaderboard entries"
ON public.leaderboard_entries FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for loot boxes (public read)
CREATE POLICY "Loot boxes are viewable by everyone"
ON public.loot_boxes FOR SELECT USING (true);
CREATE POLICY "Loot box rewards are viewable by everyone"
ON public.loot_box_rewards FOR SELECT USING (true);

-- RLS Policies for user loot box openings
CREATE POLICY "Users can view their own loot box openings"
ON public.user_loot_box_openings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own loot box openings"
ON public.user_loot_box_openings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for events (public read)
CREATE POLICY "Events are viewable by everyone"
ON public.events FOR SELECT USING (true);

-- RLS Policies for skins (public read)
CREATE POLICY "Skins are viewable by everyone"
ON public.skins FOR SELECT USING (true);

-- RLS Policies for user skins
CREATE POLICY "Users can view their own skins"
ON public.user_skins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skins"
ON public.user_skins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skins"
ON public.user_skins FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_missions_updated_at
BEFORE UPDATE ON public.user_missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_entries_updated_at
BEFORE UPDATE ON public.leaderboard_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default missions
INSERT INTO public.missions (title, description, mission_type, target_amount, reward_type, reward_amount) VALUES
('Mineur Débutant', 'Miner 1000 DeadSpot coins en 24h', 'mining', 1000, 'experience', 50),
('Puissance de Feu', 'Atteindre 10 GH/s de hashrate', 'mining', 10, 'deadspot', 500),
('Staker Expert', 'Avoir un total de 5000 coins stakés', 'staking', 5000, 'lootbox', 1),
('Parrain Actif', 'Référer 3 nouveaux utilisateurs', 'referral', 3, 'deadspot', 1000),
('Fidélité Quotidienne', 'Se connecter pendant 7 jours consécutifs', 'login', 7, 'powerup', 1);

-- Insert some default loot boxes
INSERT INTO public.loot_boxes (name, description, cost_deadspot, rarity) VALUES
('Coffre Commun', 'Un coffre basique avec des récompenses communes', 100, 'common'),
('Coffre Rare', 'Un coffre avec de meilleures récompenses', 500, 'rare'),
('Coffre Épique', 'Un coffre premium avec des récompenses épiques', 1500, 'epic'),
('Coffre Légendaire', 'Le coffre ultime avec les meilleures récompenses', 5000, 'legendary');

-- Insert some default loot box rewards
INSERT INTO public.loot_box_rewards (loot_box_id, reward_type, reward_name, reward_amount, drop_chance, rarity) VALUES
-- Common box rewards
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Commun'), 'deadspot', 'DeadSpot Coins', 50, 60, 'common'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Commun'), 'experience', 'Points XP', 25, 30, 'common'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Commun'), 'powerup', 'Boost Énergie', 1, 10, 'rare'),

-- Rare box rewards
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Rare'), 'deadspot', 'DeadSpot Coins', 200, 50, 'common'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Rare'), 'experience', 'Points XP', 100, 30, 'rare'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Rare'), 'multiplier', 'Double XP 1h', 1, 20, 'epic');

-- Insert some default skins
INSERT INTO public.skins (name, description, skin_type, rarity, cost_deadspot, unlocked_by) VALUES
('Avatar Classique', 'L''avatar par défaut', 'avatar', 'common', 0, 'achievement'),
('Mineur d''Or', 'Avatar doré pour les pros', 'avatar', 'epic', 2000, 'purchase'),
('Ferme Futuriste', 'Une ferme de mining high-tech', 'mining_farm', 'rare', 1000, 'purchase'),
('Thème Sombre', 'Interface sombre et élégante', 'ui_theme', 'rare', 500, 'purchase');