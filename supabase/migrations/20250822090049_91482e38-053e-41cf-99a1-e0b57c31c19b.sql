-- Update farming_data to support decimals and new counters
ALTER TABLE public.farming_data
ALTER COLUMN deadspot_coins TYPE numeric(20,8) USING deadspot_coins::numeric,
ALTER COLUMN zero_tokens TYPE numeric(20,8) USING zero_tokens::numeric;

-- Add diamonds and experience counters if not present
DO $$ BEGIN
  ALTER TABLE public.farming_data ADD COLUMN diamonds numeric(20,8) NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE public.farming_data ADD COLUMN experience numeric(20,8) NOT NULL DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- Ensure farming_slots.unlock_price remains integer for DSC costs (no change needed)
