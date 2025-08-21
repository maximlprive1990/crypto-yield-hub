import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Wheat, Carrot, Salad, Cherry } from "lucide-react";

// Définir les seeds ici pour éviter la dépendance circulaire
const SEEDS = [
  {
    id: "wheat",
    name: "Blé",
    icon: Wheat,
    price: 100,
    growthTime: 30,
    reward: 5,
    rarity: "common" as const
  },
  {
    id: "carrot", 
    name: "Carotte",
    icon: Carrot,
    price: 150,
    growthTime: 45,
    reward: 8,
    rarity: "common" as const
  },
  {
    id: "lettuce",
    name: "Courgette", 
    icon: Salad,
    price: 200,
    growthTime: 60,
    reward: 12,
    rarity: "rare" as const
  },
  {
    id: "tomato",
    name: "Tomate",
    icon: Cherry,
    price: 300,
    growthTime: 90,
    reward: 18,
    rarity: "epic" as const
  }
];

interface Seed {
  id: string;
  name: string;
  icon: any;
  price: number;
  growthTime: number;
  reward: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface FarmSlot {
  id: number;
  isUnlocked: boolean;
  unlockPrice: number;
  plantedSeed?: Seed;
  plantedAt?: Date;
  isGrowing: boolean;
}

interface InventoryItem {
  seedId: string;
  quantity: number;
}

export const useFarmingPersistence = () => {
  const { user } = useAuth();
  const [deadspotCoins, setDeadspotCoins] = useState(500);
  const [zeroTokens, setZeroTokens] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [slots, setSlots] = useState<FarmSlot[]>([
    { id: 1, isUnlocked: true, unlockPrice: 0, isGrowing: false },
    { id: 2, isUnlocked: false, unlockPrice: 1, isGrowing: false },
    { id: 3, isUnlocked: false, unlockPrice: 2, isGrowing: false },
    { id: 4, isUnlocked: false, unlockPrice: 3, isGrowing: false },
    { id: 5, isUnlocked: false, unlockPrice: 4, isGrowing: false },
    { id: 6, isUnlocked: false, unlockPrice: 5, isGrowing: false }
  ]);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis la base de données
  useEffect(() => {
    const loadFarmingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Charger les données principales
        const { data: farmingData } = await supabase
          .from('farming_data')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (farmingData) {
          setDeadspotCoins(farmingData.deadspot_coins);
          setZeroTokens(farmingData.zero_tokens);
        } else {
          // Créer les données initiales si elles n'existent pas
          await supabase
            .from('farming_data')
            .insert({
              user_id: user.id,
              deadspot_coins: 500,
              zero_tokens: 0,
            });
        }

        // Charger les slots
        const { data: slotsData } = await supabase
          .from('farming_slots')
          .select('*')
          .eq('user_id', user.id)
          .order('slot_id');

        if (slotsData && slotsData.length > 0) {
          const loadedSlots = slotsData.map(slot => ({
            id: slot.slot_id,
            isUnlocked: slot.is_unlocked,
            unlockPrice: slot.unlock_price,
            plantedSeed: slot.planted_seed_id ? 
              SEEDS.find(s => s.id === slot.planted_seed_id) : undefined,
            plantedAt: slot.planted_at ? new Date(slot.planted_at) : undefined,
            isGrowing: slot.is_growing
          }));
          setSlots(loadedSlots);
        } else {
          // Créer les slots initiaux
          const initialSlots = [
            { user_id: user.id, slot_id: 1, is_unlocked: true, unlock_price: 0, is_growing: false },
            { user_id: user.id, slot_id: 2, is_unlocked: false, unlock_price: 1, is_growing: false },
            { user_id: user.id, slot_id: 3, is_unlocked: false, unlock_price: 2, is_growing: false },
            { user_id: user.id, slot_id: 4, is_unlocked: false, unlock_price: 3, is_growing: false },
            { user_id: user.id, slot_id: 5, is_unlocked: false, unlock_price: 4, is_growing: false },
            { user_id: user.id, slot_id: 6, is_unlocked: false, unlock_price: 5, is_growing: false },
          ];
          
          await supabase
            .from('farming_slots')
            .insert(initialSlots);
        }

        // Charger l'inventaire
        const { data: inventoryData } = await supabase
          .from('farming_inventory')
          .select('*')
          .eq('user_id', user.id);

        if (inventoryData) {
          const loadedInventory = inventoryData.map(item => ({
            seedId: item.seed_id,
            quantity: item.quantity
          }));
          setInventory(loadedInventory);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données de farming:', error);
      }

      setLoading(false);
    };

    loadFarmingData();
  }, [user]);

  // Sauvegarder les données principales
  const saveFarmingData = async (coins: number, tokens: number) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('farming_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('farming_data')
          .update({
            deadspot_coins: coins,
            zero_tokens: tokens,
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('farming_data')
          .insert({
            user_id: user.id,
            deadspot_coins: coins,
            zero_tokens: tokens,
          });
      }

      setDeadspotCoins(coins);
      setZeroTokens(tokens);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données de farming:', error);
    }
  };

  // Sauvegarder les slots
  const saveSlots = async (newSlots: FarmSlot[]) => {
    if (!user) return;

    try {
      for (const slot of newSlots) {
        const { data: existing } = await supabase
          .from('farming_slots')
          .select('id')
          .eq('user_id', user.id)
          .eq('slot_id', slot.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('farming_slots')
            .update({
              is_unlocked: slot.isUnlocked,
              unlock_price: slot.unlockPrice,
              planted_seed_id: slot.plantedSeed?.id || null,
              planted_at: slot.plantedAt?.toISOString() || null,
              is_growing: slot.isGrowing,
            })
            .eq('user_id', user.id)
            .eq('slot_id', slot.id);
        } else {
          await supabase
            .from('farming_slots')
            .insert({
              user_id: user.id,
              slot_id: slot.id,
              is_unlocked: slot.isUnlocked,
              unlock_price: slot.unlockPrice,
              planted_seed_id: slot.plantedSeed?.id || null,
              planted_at: slot.plantedAt?.toISOString() || null,
              is_growing: slot.isGrowing,
            });
        }
      }

      setSlots(newSlots);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des slots:', error);
    }
  };

  // Sauvegarder l'inventaire
  const saveInventory = async (newInventory: InventoryItem[]) => {
    if (!user) return;

    try {
      // Supprimer l'ancien inventaire
      await supabase
        .from('farming_inventory')
        .delete()
        .eq('user_id', user.id);

      // Insérer le nouvel inventaire avec upsert pour éviter les conflits
      if (newInventory.length > 0) {
        const inventoryToSave = newInventory.map(item => ({
          user_id: user.id,
          seed_id: item.seedId,
          quantity: item.quantity,
        }));

        await supabase
          .from('farming_inventory')
          .upsert(inventoryToSave, { 
            onConflict: 'user_id,seed_id',
            ignoreDuplicates: false 
          });
      }

      setInventory(newInventory);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'inventaire:', error);
    }
  };

  return {
    deadspotCoins,
    zeroTokens,
    inventory,
    slots,
    loading,
    SEEDS, // Export the SEEDS array
    setDeadspotCoins: (coins: number) => saveFarmingData(coins, zeroTokens),
    setZeroTokens: (tokens: number) => saveFarmingData(deadspotCoins, tokens),
    setInventory: saveInventory,
    setSlots: saveSlots,
  };
};