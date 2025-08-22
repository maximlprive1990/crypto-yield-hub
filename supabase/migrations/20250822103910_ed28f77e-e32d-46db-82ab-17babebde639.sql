-- Ajouter les nouvelles colonnes pour l'énergie et l'expérience de mining
ALTER TABLE public.farming_data 
ADD COLUMN IF NOT EXISTS energy numeric NOT NULL DEFAULT 1000,
ADD COLUMN IF NOT EXISTS max_energy numeric NOT NULL DEFAULT 1000,
ADD COLUMN IF NOT EXISTS mining_experience numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS mining_level integer NOT NULL DEFAULT 1;