import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Player, Equipment, PlayerStats } from '@/types/rpg';
import { useAuth } from './useAuth';

export const useRPGPersistence = () => {
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données du joueur depuis la base de données
  useEffect(() => {
    const loadPlayerData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Charger les données du joueur
        const { data: playerData } = await supabase
          .from('rpg_players')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (playerData) {
          // Charger l'inventaire
          const { data: inventoryData } = await supabase
            .from('rpg_inventory')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          // Charger l'équipement
          const { data: equipmentData } = await supabase
            .from('rpg_equipment')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          const loadedPlayer: Player = {
            id: playerData.id,
            name: playerData.player_name,
            class: {
              id: playerData.class_id,
              name: playerData.class_id,
              description: '',
              baseStats: playerData.base_stats as unknown as PlayerStats,
              icon: '',
              color: ''
            },
            level: playerData.level,
            experience: playerData.experience,
            experienceToNext: playerData.experience_to_next,
            baseStats: playerData.base_stats as unknown as PlayerStats,
            currentStats: playerData.current_stats as unknown as PlayerStats,
            equipment: {
              weapon: equipmentData?.weapon as unknown as Equipment || undefined,
              armor: equipmentData?.armor as unknown as Equipment || undefined,
              ring: equipmentData?.ring as unknown as Equipment || undefined,
              amulet: equipmentData?.amulet as unknown as Equipment || undefined,
            },
            inventory: (inventoryData?.equipment_data as unknown as Equipment[]) || [],
            gold: playerData.gold,
            diamonds: playerData.diamonds || 0,
            statPoints: playerData.stat_points,
            enemiesDefeated: playerData.enemies_defeated,
            zeroCoins: playerData.zero_coins,
          };

          setPlayer(loadedPlayer);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données RPG:', error);
      }

      setLoading(false);
    };

    loadPlayerData();
  }, [user]);

  // Sauvegarder les données du joueur
  const savePlayerData = async (playerToSave: Player) => {
    if (!user) return;

    try {
      // Sauvegarder les données principales du joueur
      const { data: existingPlayer } = await supabase
        .from('rpg_players')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingPlayer) {
        await supabase
          .from('rpg_players')
          .update({
            player_name: playerToSave.name,
            class_id: playerToSave.class.id,
            level: playerToSave.level,
            experience: playerToSave.experience,
            experience_to_next: playerToSave.experienceToNext,
            base_stats: playerToSave.baseStats as any,
            current_stats: playerToSave.currentStats as any,
            gold: playerToSave.gold,
            stat_points: playerToSave.statPoints,
            enemies_defeated: playerToSave.enemiesDefeated,
            zero_coins: playerToSave.zeroCoins,
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('rpg_players')
          .insert({
            user_id: user.id,
            player_name: playerToSave.name,
            class_id: playerToSave.class.id,
            level: playerToSave.level,
            experience: playerToSave.experience,
            experience_to_next: playerToSave.experienceToNext,
            base_stats: playerToSave.baseStats as any,
            current_stats: playerToSave.currentStats as any,
            gold: playerToSave.gold,
            stat_points: playerToSave.statPoints,
            enemies_defeated: playerToSave.enemiesDefeated,
            zero_coins: playerToSave.zeroCoins,
          });
      }

      // Sauvegarder l'inventaire
      const { data: existingInventory } = await supabase
        .from('rpg_inventory')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingInventory) {
        await supabase
          .from('rpg_inventory')
          .update({
            equipment_data: playerToSave.inventory as any,
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('rpg_inventory')
          .insert({
            user_id: user.id,
            equipment_data: playerToSave.inventory as any,
          });
      }

      // Sauvegarder l'équipement
      const { data: existingEquipment } = await supabase
        .from('rpg_equipment')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingEquipment) {
        await supabase
          .from('rpg_equipment')
          .update({
            weapon: playerToSave.equipment.weapon as any || null,
            armor: playerToSave.equipment.armor as any || null,
            ring: playerToSave.equipment.ring as any || null,
            amulet: playerToSave.equipment.amulet as any || null,
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('rpg_equipment')
          .insert({
            user_id: user.id,
            weapon: playerToSave.equipment.weapon as any || null,
            armor: playerToSave.equipment.armor as any || null,
            ring: playerToSave.equipment.ring as any || null,
            amulet: playerToSave.equipment.amulet as any || null,
          });
      }

      setPlayer(playerToSave);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données RPG:', error);
    }
  };

  return { player, setPlayer: savePlayerData, loading };
};