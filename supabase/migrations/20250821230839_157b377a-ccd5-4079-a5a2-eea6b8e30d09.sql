-- Fix the remaining function security warning by setting search_path

CREATE OR REPLACE FUNCTION public.update_platform_stat(stat_name_param text, increment_value numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  UPDATE public.platform_stats 
  SET stat_value = stat_value + increment_value,
      updated_at = now()
  WHERE stat_name = stat_name_param;
END;
$function$;