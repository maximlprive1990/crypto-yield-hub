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
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
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