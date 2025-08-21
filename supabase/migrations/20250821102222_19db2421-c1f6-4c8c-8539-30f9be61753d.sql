-- Add RLS policies and initial data for the gaming features

-- RLS Policies for missions (public read, no user-specific data)
CREATE POLICY "Missions are viewable by everyone"
ON public.missions FOR SELECT USING (true);

-- RLS Policies for user_missions
CREATE POLICY "Users can view their own missions"
ON public.user_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own missions"
ON public.user_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own missions"
ON public.user_missions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for leaderboards (public read)
CREATE POLICY "Leaderboards are viewable by everyone"
ON public.leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Users can insert their own leaderboard entries"
ON public.leaderboard_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own leaderboard entries"
ON public.leaderboard_entries FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for loot boxes (public read)
CREATE POLICY "Loot boxes are viewable by everyone"
ON public.loot_boxes FOR SELECT USING (true);
CREATE POLICY "Loot box rewards are viewable by everyone"
ON public.loot_box_rewards FOR SELECT USING (true);

-- RLS Policies for user loot box openings
CREATE POLICY "Users can view their own loot box openings"
ON public.user_loot_box_openings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own loot box openings"
ON public.user_loot_box_openings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for events (public read)
CREATE POLICY "Events are viewable by everyone"
ON public.events FOR SELECT USING (true);

-- RLS Policies for skins (public read)
CREATE POLICY "Skins are viewable by everyone"
ON public.skins FOR SELECT USING (true);

-- RLS Policies for user skins
CREATE POLICY "Users can view their own skins"
ON public.user_skins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own skins"
ON public.user_skins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own skins"
ON public.user_skins FOR UPDATE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_missions_updated_at
BEFORE UPDATE ON public.user_missions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaderboard_entries_updated_at
BEFORE UPDATE ON public.leaderboard_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default missions
INSERT INTO public.missions (title, description, mission_type, target_amount, reward_type, reward_amount) VALUES
('Mineur Débutant', 'Miner 1000 DeadSpot coins en 24h', 'mining', 1000, 'experience', 50),
('Puissance de Feu', 'Atteindre 10 GH/s de hashrate', 'mining', 10, 'deadspot', 500),
('Staker Expert', 'Avoir un total de 5000 coins stakés', 'staking', 5000, 'lootbox', 1),
('Parrain Actif', 'Référer 3 nouveaux utilisateurs', 'referral', 3, 'deadspot', 1000),
('Fidélité Quotidienne', 'Se connecter pendant 7 jours consécutifs', 'login', 7, 'powerup', 1);

-- Insert some default loot boxes
INSERT INTO public.loot_boxes (name, description, cost_deadspot, rarity) VALUES
('Coffre Commun', 'Un coffre basique avec des récompenses communes', 100, 'common'),
('Coffre Rare', 'Un coffre avec de meilleures récompenses', 500, 'rare'),
('Coffre Épique', 'Un coffre premium avec des récompenses épiques', 1500, 'epic'),
('Coffre Légendaire', 'Le coffre ultime avec les meilleures récompenses', 5000, 'legendary');

-- Insert some default loot box rewards
INSERT INTO public.loot_box_rewards (loot_box_id, reward_type, reward_name, reward_amount, drop_chance, rarity) VALUES
-- Common box rewards
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Commun'), 'deadspot', 'DeadSpot Coins', 50, 60, 'common'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Commun'), 'experience', 'Points XP', 25, 30, 'common'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Commun'), 'powerup', 'Boost Énergie', 1, 10, 'rare'),

-- Rare box rewards
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Rare'), 'deadspot', 'DeadSpot Coins', 200, 50, 'common'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Rare'), 'experience', 'Points XP', 100, 30, 'rare'),
((SELECT id FROM public.loot_boxes WHERE name = 'Coffre Rare'), 'multiplier', 'Double XP 1h', 1, 20, 'epic');

-- Insert some default skins
INSERT INTO public.skins (name, description, skin_type, rarity, cost_deadspot, unlocked_by) VALUES
('Avatar Classique', 'L''avatar par défaut', 'avatar', 'common', 0, 'achievement'),
('Mineur d''Or', 'Avatar doré pour les pros', 'avatar', 'epic', 2000, 'purchase'),
('Ferme Futuriste', 'Une ferme de mining high-tech', 'mining_farm', 'rare', 1000, 'purchase'),
('Thème Sombre', 'Interface sombre et élégante', 'ui_theme', 'rare', 500, 'purchase');

-- Insert a current event
INSERT INTO public.events (title, description, event_type, multiplier, start_date, end_date) VALUES
('Week-end Double XP', 'Gagnez le double d''expérience pendant tout le week-end !', 'double_xp', 2.0, NOW(), NOW() + INTERVAL '3 days');