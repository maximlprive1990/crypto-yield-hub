import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { 
  Wheat, 
  Carrot, 
  Salad, 
  Cherry, 
  Apple,
  Grape,
  TreePine,
  Flower,
  Flower2,
  Gem,
  Crown,
  Sparkles
} from "lucide-react";

// Définir les seeds ici pour éviter la dépendance circulaire
const SEEDS = [
  // Common Seeds
  {
    id: "wheat",
    name: "Blé",
    icon: Wheat,
    price: 50,
    growthTime: 15,
    reward: 2,
    rarity: "common" as const
  },
  {
    id: "carrot", 
    name: "Carotte",
    icon: Carrot,
    price: 75,
    growthTime: 20,
    reward: 3,
    rarity: "common" as const
  },
  {
    id: "lettuce",
    name: "Salade", 
    icon: Salad,
    price: 100,
    growthTime: 25,
    reward: 4,
    rarity: "common" as const
  },
  
  // Rare Seeds
  {
    id: "tomato",
    name: "Tomate",
    icon: Cherry,
    price: 200,
    growthTime: 40,
    reward: 8,
    rarity: "rare" as const
  },
  {
    id: "apple",
    name: "Pomme",
    icon: Apple,
    price: 350,
    growthTime: 60,
    reward: 15,
    rarity: "rare" as const
  },
  {
    id: "grape",
    name: "Raisin",
    icon: Grape,
    price: 500,
    growthTime: 80,
    reward: 22,
    rarity: "rare" as const
  },
  
  // Epic Seeds
  {
    id: "magical_tree",
    name: "Arbre Magique",
    icon: TreePine,
    price: 1000,
    growthTime: 120,
    reward: 50,
    rarity: "epic" as const
  },
  {
    id: "crystal_flower",
    name: "Fleur Cristal",
    icon: Flower,
    price: 1500,
    growthTime: 150,
    reward: 75,
    rarity: "epic" as const
  },
  {
    id: "golden_bloom",
    name: "Floraison Dorée",
    icon: Flower2,
    price: 2500,
    growthTime: 200,
    reward: 125,
    rarity: "epic" as const
  },
  
  // Legendary Seeds
  {
    id: "diamond_seed",
    name: "Graine Diamant",
    icon: Gem,
    price: 5000,
    growthTime: 300,
    reward: 250,
    rarity: "legendary" as const
  },
  {
    id: "royal_seed",
    name: "Graine Royale",
    icon: Crown,
    price: 10000,
    growthTime: 480,
    reward: 500,
    rarity: "legendary" as const
  },
  {
    id: "cosmic_seed",
    name: "Graine Cosmique",
    icon: Sparkles,
    price: 25000,
    growthTime: 720,
    reward: 1250,
    rarity: "legendary" as const
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
  const [diamonds, setDiamonds] = useState(0);
  const [experience, setExperience] = useState(0);
  const [energy, setEnergy] = useState(1000);
  const [maxEnergy, setMaxEnergy] = useState(1000);
  const [miningExperience, setMiningExperience] = useState(0);
  const [miningLevel, setMiningLevel] = useState(1);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [slots, setSlots] = useState<FarmSlot[]>([
    { id: 1, isUnlocked: true, unlockPrice: 0, isGrowing: false },
    { id: 2, isUnlocked: false, unlockPrice: 100, isGrowing: false },
    { id: 3, isUnlocked: false, unlockPrice: 1000, isGrowing: false },
    { id: 4, isUnlocked: false, unlockPrice: 5000, isGrowing: false },
    { id: 5, isUnlocked: false, unlockPrice: 15000, isGrowing: false },
    { id: 6, isUnlocked: false, unlockPrice: 50000, isGrowing: false }
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
          setDeadspotCoins(Number(farmingData.deadspot_coins));
          setZeroTokens(Number(farmingData.zero_tokens));
          setDiamonds(Number(farmingData.diamonds || 0));
          setExperience(Number(farmingData.experience || 0));
          setEnergy(Number(farmingData.energy || 1000));
          setMaxEnergy(Number(farmingData.max_energy || 1000));
          setMiningExperience(Number(farmingData.mining_experience || 0));
          setMiningLevel(Number(farmingData.mining_level || 1));
        } else {
          // Créer les données initiales si elles n'existent pas
          await supabase
            .from('farming_data')
            .insert({
              user_id: user.id,
              deadspot_coins: 500,
              zero_tokens: 0,
              diamonds: 0,
              experience: 0,
              energy: 1000,
              max_energy: 1000,
              mining_experience: 0,
              mining_level: 1,
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
            { user_id: user.id, slot_id: 2, is_unlocked: false, unlock_price: 100, is_growing: false },
            { user_id: user.id, slot_id: 3, is_unlocked: false, unlock_price: 1000, is_growing: false },
            { user_id: user.id, slot_id: 4, is_unlocked: false, unlock_price: 5000, is_growing: false },
            { user_id: user.id, slot_id: 5, is_unlocked: false, unlock_price: 15000, is_growing: false },
            { user_id: user.id, slot_id: 6, is_unlocked: false, unlock_price: 50000, is_growing: false },
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
  const saveFarmingData = async (
    coins: number, 
    tokens: number, 
    diamondsValue?: number, 
    experienceValue?: number,
    energyValue?: number,
    maxEnergyValue?: number,
    miningExpValue?: number,
    miningLevelValue?: number
  ) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('farming_data')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      const updateData = {
        deadspot_coins: coins,
        zero_tokens: tokens,
        ...(diamondsValue !== undefined && { diamonds: diamondsValue }),
        ...(experienceValue !== undefined && { experience: experienceValue }),
        ...(energyValue !== undefined && { energy: energyValue }),
        ...(maxEnergyValue !== undefined && { max_energy: maxEnergyValue }),
        ...(miningExpValue !== undefined && { mining_experience: miningExpValue }),
        ...(miningLevelValue !== undefined && { mining_level: miningLevelValue }),
      };

      if (existing) {
        await supabase
          .from('farming_data')
          .update(updateData)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('farming_data')
          .insert({
            user_id: user.id,
            ...updateData,
          });
      }

      setDeadspotCoins(coins);
      setZeroTokens(tokens);
      if (diamondsValue !== undefined) setDiamonds(diamondsValue);
      if (experienceValue !== undefined) setExperience(experienceValue);
      if (energyValue !== undefined) setEnergy(energyValue);
      if (maxEnergyValue !== undefined) setMaxEnergy(maxEnergyValue);
      if (miningExpValue !== undefined) setMiningExperience(miningExpValue);
      if (miningLevelValue !== undefined) setMiningLevel(miningLevelValue);
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

  // Calculer l'expérience nécessaire pour le prochain niveau de mining
  const getRequiredExperience = (level: number) => {
    if (level === 1) return 10;
    return Math.ceil(10 * Math.pow(1.0278, level - 1));
  };

  // Fonction pour gérer le level up de mining
  const checkMiningLevelUp = (currentExp: number, currentLevel: number) => {
    const requiredExp = getRequiredExperience(currentLevel + 1);
    if (currentExp >= requiredExp) {
      const newLevel = currentLevel + 1;
      const remainingExp = currentExp - requiredExp;
      setMiningLevel(newLevel);
      setMiningExperience(remainingExp);
      saveFarmingData(deadspotCoins, zeroTokens, diamonds, experience, energy, maxEnergy, remainingExp, newLevel);
      return newLevel;
    }
    return currentLevel;
  };

  return {
    deadspotCoins,
    zeroTokens,
    diamonds,
    experience,
    energy,
    maxEnergy,
    miningExperience,
    miningLevel,
    inventory,
    slots,
    loading,
    SEEDS, // Export the SEEDS array
    getRequiredExperience,
    checkMiningLevelUp,
    setDeadspotCoins: (coins: number) => saveFarmingData(coins, zeroTokens),
    setZeroTokens: (tokens: number) => saveFarmingData(deadspotCoins, tokens),
    setDiamonds: (diamondsValue: number) => saveFarmingData(deadspotCoins, zeroTokens, diamondsValue, experience),
    setExperience: (experienceValue: number) => saveFarmingData(deadspotCoins, zeroTokens, diamonds, experienceValue),
    setEnergy: (energyValue: number) => saveFarmingData(deadspotCoins, zeroTokens, diamonds, experience, energyValue, maxEnergy),
    setMaxEnergy: (maxEnergyValue: number) => saveFarmingData(deadspotCoins, zeroTokens, diamonds, experience, energy, maxEnergyValue),
    setMiningExperience: (miningExpValue: number) => {
      const newLevel = checkMiningLevelUp(miningExpValue, miningLevel);
      if (newLevel === miningLevel) {
        saveFarmingData(deadspotCoins, zeroTokens, diamonds, experience, energy, maxEnergy, miningExpValue, miningLevel);
      }
    },
    setMiningLevel: (miningLevelValue: number) => saveFarmingData(deadspotCoins, zeroTokens, diamonds, experience, energy, maxEnergy, miningExperience, miningLevelValue),
    setInventory: saveInventory,
    setSlots: saveSlots,
  };
};