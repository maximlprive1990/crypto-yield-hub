-- Add new columns to staking_positions table for custom staking
ALTER TABLE public.staking_positions 
ADD COLUMN duration_days INTEGER,
ADD COLUMN end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN wallet_address TEXT,
ADD COLUMN memo TEXT;

-- Update existing rows to have default values
UPDATE public.staking_positions 
SET duration_days = 30, 
    end_date = started_at + INTERVAL '30 days'
WHERE duration_days IS NULL;