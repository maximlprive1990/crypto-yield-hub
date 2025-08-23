import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MiningData {
  accumulated_hashrate: number;
  deadspot_coins: number;
  total_blocks_mined: number;
  total_hashrate_earned: number;
  is_currently_mining: boolean;
  mining_throttle: number;
  current_mining_session_start?: string;
}

export const useMiningPersistence = () => {
  const { user } = useAuth();
  const [miningData, setMiningData] = useState<MiningData>({
    accumulated_hashrate: 0,
    deadspot_coins: 0,
    total_blocks_mined: 0,
    total_hashrate_earned: 0,
    is_currently_mining: false,
    mining_throttle: 0.5,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données de mining au démarrage
  const loadMiningData = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('mining_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erreur lors du chargement des données de mining:', error);
        return;
      }

      if (data) {
        setMiningData({
          accumulated_hashrate: Number(data.accumulated_hashrate),
          deadspot_coins: Number(data.deadspot_coins),
          total_blocks_mined: data.total_blocks_mined,
          total_hashrate_earned: Number(data.total_hashrate_earned),
          is_currently_mining: data.is_currently_mining,
          mining_throttle: Number(data.mining_throttle),
          current_mining_session_start: data.current_mining_session_start,
        });
      } else {
        // Créer une nouvelle entrée si elle n'existe pas
        await createInitialMiningData();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données de mining:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Créer les données initiales de mining
  const createInitialMiningData = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mining_data')
        .insert({
          user_id: user.id,
          accumulated_hashrate: 0,
          deadspot_coins: 0,
          total_blocks_mined: 0,
          total_hashrate_earned: 0,
          is_currently_mining: false,
          mining_throttle: 0.5,
        });

      if (error) {
        console.error('Erreur lors de la création des données de mining:', error);
      }
    } catch (error) {
      console.error('Erreur lors de la création des données de mining:', error);
    }
  };

  // Sauvegarder les données de mining
  const saveMiningData = useCallback(async (updates: Partial<MiningData>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mining_data')
        .update(updates)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la sauvegarde des données de mining:', error);
        toast.error('Erreur lors de la sauvegarde des données de mining');
        return false;
      }

      // Mettre à jour l'état local
      setMiningData(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données de mining:', error);
      toast.error('Erreur lors de la sauvegarde des données de mining');
      return false;
    }
  }, [user]);

  // Ajouter un bloc miné
  const addMinedBlock = useCallback(async (blockReward: number, currentHashrate: number) => {
    if (!user) return false;

    try {
      // Ajouter le bloc à l'historique
      const { error: blockError } = await supabase
        .from('mining_blocks')
        .insert({
          user_id: user.id,
          block_reward: blockReward,
          current_hashrate: currentHashrate,
        });

      if (blockError) {
        console.error('Erreur lors de l\'ajout du bloc:', blockError);
        return false;
      }

      // Mettre à jour les données de mining
      const newData = {
        accumulated_hashrate: miningData.accumulated_hashrate + blockReward,
        total_blocks_mined: miningData.total_blocks_mined + 1,
        total_hashrate_earned: miningData.total_hashrate_earned + blockReward,
      };

      return await saveMiningData(newData);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du bloc:', error);
      return false;
    }
  }, [user, miningData, saveMiningData]);

  // Échanger des hashrates contre des deadspot coins
  const exchangeHashrate = useCallback(async () => {
    if (!user) return false;

    const exchangeRate = 100000; // 100000 hashrate = 0.15 deadspot coin
    const coinValue = 0.15;
    
    if (miningData.accumulated_hashrate < exchangeRate) {
      toast.error('Pas assez de hashrate pour l\'échange');
      return false;
    }

    const exchanges = Math.floor(miningData.accumulated_hashrate / exchangeRate);
    const hashrateUsed = exchanges * exchangeRate;
    const coinsEarned = exchanges * coinValue;

    try {
      // Enregistrer l'échange dans l'historique
      const { error: exchangeError } = await supabase
        .from('hashrate_exchanges')
        .insert({
          user_id: user.id,
          hashrate_amount: hashrateUsed,
          deadspot_coins_received: coinsEarned,
          exchange_rate: exchangeRate,
        });

      if (exchangeError) {
        console.error('Erreur lors de l\'enregistrement de l\'échange:', exchangeError);
        return false;
      }

      // Mettre à jour les données de mining
      const newData = {
        accumulated_hashrate: miningData.accumulated_hashrate - hashrateUsed,
        deadspot_coins: miningData.deadspot_coins + coinsEarned,
      };

      // Mettre à jour également le profil utilisateur
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          deadspot_tokens: miningData.deadspot_coins + coinsEarned,
        })
        .eq('user_id', user.id);

      if (profileError) {
        console.error('Erreur lors de la mise à jour du profil:', profileError);
      }

      const success = await saveMiningData(newData);
      
      if (success) {
        toast.success(`Échange réussi! +${coinsEarned.toFixed(2)} DSC`);
      }

      return success;
    } catch (error) {
      console.error('Erreur lors de l\'échange:', error);
      toast.error('Erreur lors de l\'échange');
      return false;
    }
  }, [user, miningData, saveMiningData]);

  // Démarrer/arrêter le mining
  const toggleMining = useCallback(async (isStarting: boolean) => {
    const updates: Partial<MiningData> = {
      is_currently_mining: isStarting,
    };

    if (isStarting) {
      updates.current_mining_session_start = new Date().toISOString();
    } else {
      updates.current_mining_session_start = undefined;
    }

    return await saveMiningData(updates);
  }, [saveMiningData]);

  // Mettre à jour le throttle
  const updateThrottle = useCallback(async (newThrottle: number) => {
    return await saveMiningData({ mining_throttle: newThrottle });
  }, [saveMiningData]);

  // Charger les données au démarrage
  useEffect(() => {
    loadMiningData();
  }, [loadMiningData]);

  return {
    miningData,
    isLoading,
    addMinedBlock,
    exchangeHashrate,
    toggleMining,
    updateThrottle,
    saveMiningData,
    loadMiningData,
  };
};
