-- Add diamonds column to rpg_players table
ALTER TABLE public.rpg_players 
ADD COLUMN diamonds integer NOT NULL DEFAULT 0;