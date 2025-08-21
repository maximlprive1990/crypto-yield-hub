-- Allow users to delete their own farming inventory (needed to clean removed seeds)
CREATE POLICY "Users can delete their own farming inventory"
ON public.farming_inventory
FOR DELETE
USING (auth.uid() = user_id);
