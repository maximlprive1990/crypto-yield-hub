-- Table pour stocker les données de mining des utilisateurs
CREATE TABLE public.mining_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  accumulated_hashrate NUMERIC NOT NULL DEFAULT 0,
  deadspot_coins NUMERIC NOT NULL DEFAULT 0,
  total_blocks_mined INTEGER NOT NULL DEFAULT 0,
  total_hashrate_earned NUMERIC NOT NULL DEFAULT 0,
  current_mining_session_start TIMESTAMP WITH TIME ZONE,
  is_currently_mining BOOLEAN NOT NULL DEFAULT false,
  mining_throttle NUMERIC NOT NULL DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des échanges hashrate -> deadspot coins
CREATE TABLE public.hashrate_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hashrate_amount NUMERIC NOT NULL,
  deadspot_coins_received NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL DEFAULT 10000, -- 10000 hashrate = 0.25 deadspot
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table pour l'historique des blocs minés
CREATE TABLE public.mining_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  block_reward NUMERIC NOT NULL,
  block_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_hashrate NUMERIC NOT NULL DEFAULT 0,
  session_id UUID -- Pour lier aux sessions de mining
);

-- Enable RLS pour mining_data
ALTER TABLE public.mining_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mining data" 
ON public.mining_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining data" 
ON public.mining_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mining data" 
ON public.mining_data 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Enable RLS pour hashrate_exchanges
ALTER TABLE public.hashrate_exchanges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hashrate exchanges" 
ON public.hashrate_exchanges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hashrate exchanges" 
ON public.hashrate_exchanges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Enable RLS pour mining_blocks
ALTER TABLE public.mining_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mining blocks" 
ON public.mining_blocks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mining blocks" 
ON public.mining_blocks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Trigger pour mise à jour automatique de updated_at
CREATE TRIGGER update_mining_data_updated_at
  BEFORE UPDATE ON public.mining_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index pour améliorer les performances
CREATE INDEX idx_mining_data_user_id ON public.mining_data(user_id);
CREATE INDEX idx_hashrate_exchanges_user_id ON public.hashrate_exchanges(user_id);
CREATE INDEX idx_mining_blocks_user_id ON public.mining_blocks(user_id);
CREATE INDEX idx_mining_blocks_block_time ON public.mining_blocks(block_time);