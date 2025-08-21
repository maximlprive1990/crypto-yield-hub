-- Create platform statistics table
CREATE TABLE public.platform_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_name TEXT NOT NULL UNIQUE,
  stat_value NUMERIC NOT NULL DEFAULT 0,
  display_format TEXT NOT NULL DEFAULT 'number', -- 'number', 'currency', 'percentage'
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Platform stats are viewable by everyone" ON public.platform_stats
FOR SELECT USING (true);

-- Create policy for system updates only
CREATE POLICY "Only system can update platform stats" ON public.platform_stats
FOR UPDATE USING (false);

CREATE POLICY "Only system can insert platform stats" ON public.platform_stats
FOR INSERT WITH CHECK (false);

-- Add trigger for updated_at
CREATE TRIGGER update_platform_stats_updated_at
  BEFORE UPDATE ON public.platform_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial realistic statistics
INSERT INTO public.platform_stats (stat_name, stat_value, display_format) VALUES
('total_value_locked', 485000, 'currency'),
('active_stakers', 2847, 'number'),
('rewards_distributed', 127500, 'currency'),
('total_users', 3200, 'number'),
('total_deposits', 156, 'number'),
('total_withdrawals', 89, 'number'),
('average_apy', 4.2, 'percentage');

-- Create function to update stats when real activities happen
CREATE OR REPLACE FUNCTION public.update_platform_stat(stat_name_param TEXT, increment_value NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.platform_stats 
  SET stat_value = stat_value + increment_value,
      updated_at = now()
  WHERE stat_name = stat_name_param;
END;
$$;