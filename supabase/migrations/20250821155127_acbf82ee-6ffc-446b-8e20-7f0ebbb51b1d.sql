-- Créer les tables pour persister les données RPG et Farming

-- Table pour les données du joueur RPG
CREATE TABLE public.rpg_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  player_name TEXT NOT NULL,
  class_id TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  experience_to_next INTEGER NOT NULL DEFAULT 100,
  base_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  current_stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  gold INTEGER NOT NULL DEFAULT 100,
  stat_points INTEGER NOT NULL DEFAULT 0,
  enemies_defeated INTEGER NOT NULL DEFAULT 0,
  zero_coins NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'inventaire RPG
CREATE TABLE public.rpg_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  equipment_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'équipement équipé RPG
CREATE TABLE public.rpg_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weapon JSONB NULL,
  armor JSONB NULL,
  ring JSONB NULL,
  amulet JSONB NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les données du système de ferme
CREATE TABLE public.farming_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  deadspot_coins INTEGER NOT NULL DEFAULT 500,
  zero_tokens INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour les slots de ferme
CREATE TABLE public.farming_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  slot_id INTEGER NOT NULL,
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  unlock_price INTEGER NOT NULL DEFAULT 0,
  planted_seed_id TEXT NULL,
  planted_at TIMESTAMP WITH TIME ZONE NULL,
  is_growing BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot_id)
);

-- Table pour l'inventaire de graines
CREATE TABLE public.farming_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  seed_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, seed_id)
);

-- Enable RLS sur toutes les tables
ALTER TABLE public.rpg_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpg_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rpg_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_inventory ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour rpg_players
CREATE POLICY "Users can view their own RPG player" 
ON public.rpg_players 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RPG player" 
ON public.rpg_players 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RPG player" 
ON public.rpg_players 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politiques RLS pour rpg_inventory
CREATE POLICY "Users can view their own RPG inventory" 
ON public.rpg_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RPG inventory" 
ON public.rpg_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RPG inventory" 
ON public.rpg_inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politiques RLS pour rpg_equipment
CREATE POLICY "Users can view their own RPG equipment" 
ON public.rpg_equipment 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own RPG equipment" 
ON public.rpg_equipment 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RPG equipment" 
ON public.rpg_equipment 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politiques RLS pour farming_data
CREATE POLICY "Users can view their own farming data" 
ON public.farming_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farming data" 
ON public.farming_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farming data" 
ON public.farming_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politiques RLS pour farming_slots
CREATE POLICY "Users can view their own farming slots" 
ON public.farming_slots 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farming slots" 
ON public.farming_slots 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farming slots" 
ON public.farming_slots 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Politiques RLS pour farming_inventory
CREATE POLICY "Users can view their own farming inventory" 
ON public.farming_inventory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farming inventory" 
ON public.farming_inventory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farming inventory" 
ON public.farming_inventory 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers pour updated_at
CREATE TRIGGER update_rpg_players_updated_at
BEFORE UPDATE ON public.rpg_players
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rpg_inventory_updated_at
BEFORE UPDATE ON public.rpg_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rpg_equipment_updated_at
BEFORE UPDATE ON public.rpg_equipment
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farming_data_updated_at
BEFORE UPDATE ON public.farming_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farming_slots_updated_at
BEFORE UPDATE ON public.farming_slots
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farming_inventory_updated_at
BEFORE UPDATE ON public.farming_inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();