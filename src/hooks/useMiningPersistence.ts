
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface MiningData {
  id: string;
  user_id: string;
  accumulated_hashrate: number;
  deadspot_coins: number;
  is_currently_mining: boolean;
  mining_throttle: number;
  last_block_time: string | null;
  total_hashrate_earned: number;
  total_blocks_mined: number;
  current_mining_session_start: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_MINING_DATA: Omit<MiningData, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  accumulated_hashrate: 0,
  deadspot_coins: 0,
  is_currently_mining: false,
  mining_throttle: 0.7,
  last_block_time: null,
  total_hashrate_earned: 0,
  total_blocks_mined: 0,
  current_mining_session_start: null,
};

export const useMiningPersistence = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Charger les données de mining
  const { data: miningData, isLoading, error } = useQuery({
    queryKey: ['mining-data', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('mining_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading mining data:', error);
        throw error;
      }

      if (!data) {
        // Créer des données par défaut
        const { data: newData, error: insertError } = await supabase
          .from('mining_data')
          .insert({
            user_id: user.id,
            ...DEFAULT_MINING_DATA,
          } as any) // ... keep existing code (cast to any to align with DB shape if needed) the same ...
          .select()
          .single();

        if (insertError) throw insertError;
        return newData as MiningData;
      }

      return data as MiningData;
    },
    enabled: !!user?.id,
    staleTime: 30000,
    retry: 2,
  });

  // Mutation pour sauvegarder les données
  const saveMutation = useMutation({
    mutationFn: async (updates: Partial<MiningData>) => {
      if (!user?.id || !miningData?.id) throw new Error('Missing user or mining data');

      const { error } = await supabase
        .from('mining_data')
        .update(updates as any) // ... keep existing code (cast to any to align with DB shape if needed) the same ...
        .eq('id', miningData.id);

      if (error) throw error;
      return updates;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mining-data', user?.id] });
    },
  });

  // Ajouter un bloc miné
  const addMinedBlock = async (blockReward: number, currentHashrate: number) => {
    if (!miningData) return false;

    try {
      await saveMutation.mutateAsync({
        accumulated_hashrate: miningData.accumulated_hashrate + currentHashrate,
        total_hashrate_earned: miningData.total_hashrate_earned + currentHashrate,
        total_blocks_mined: miningData.total_blocks_mined + 1,
        last_block_time: new Date().toISOString(),
      });

      // Enregistrer le bloc dans l'historique (current_hashrate est la colonne correcte)
      await supabase.from('mining_blocks').insert({
        user_id: user?.id as string,
        block_reward: blockReward,
        current_hashrate: currentHashrate,
      });

      return true;
    } catch (error) {
      console.error('Error adding mined block:', error);
      return false;
    }
  };

  // Échanger le hashrate contre des DeadSpot coins
  const exchangeHashrate = async (hashrateAmount: number) => {
    if (!miningData) return false;

    const exchangeRate = 100000; // 100k hashrate = 0.15 DSC
    const coinsPerExchange = 0.15;
    
    if (hashrateAmount < exchangeRate) return false;

    const exchangeCount = Math.floor(hashrateAmount / exchangeRate);
    const coinsEarned = exchangeCount * coinsPerExchange;
    const totalHashrateToExchange = exchangeCount * exchangeRate;

    try {
      await saveMutation.mutateAsync({
        accumulated_hashrate: miningData.accumulated_hashrate - totalHashrateToExchange,
        deadspot_coins: miningData.deadspot_coins + coinsEarned,
      });

      // Enregistrer la transaction (colonnes correctes: hashrate_amount, deadspot_coins_received, exchange_rate)
      await supabase.from('hashrate_exchanges').insert({
        user_id: user?.id as string,
        hashrate_amount: totalHashrateToExchange,
        deadspot_coins_received: coinsEarned,
        exchange_rate: exchangeRate,
      });

      toast.success(`🎉 Échangé ${totalHashrateToExchange.toLocaleString()} hashrate contre ${coinsEarned} DSC!`);
      return true;
    } catch (error) {
      console.error('Error exchanging hashrate:', error);
      toast.error('Erreur lors de l\'échange');
      return false;
    }
  };

  // Basculer l'état de mining
  const toggleMining = async (newState: boolean) => {
    if (!miningData) return false;

    try {
      const updates: Partial<MiningData> = {
        is_currently_mining: newState,
      };

      if (newState) {
        updates.current_mining_session_start = new Date().toISOString();
      } else {
        updates.current_mining_session_start = null;
      }

      await saveMutation.mutateAsync(updates);
      return true;
    } catch (error) {
      console.error('Error toggling mining:', error);
      return false;
    }
  };

  // Mettre à jour le throttle
  const updateThrottle = async (newThrottle: number) => {
    if (!miningData) return false;

    try {
      await saveMutation.mutateAsync({
        mining_throttle: newThrottle,
      });
      return true;
    } catch (error) {
      console.error('Error updating throttle:', error);
      return false;
    }
  };

  // Méthodes pour la compatibilité avec useAllDataPersistence
  const loadMiningData = async () => {
    queryClient.invalidateQueries({ queryKey: ['mining-data', user?.id] });
  };

  const saveMiningData = async (updates: Partial<MiningData>) => {
    if (Object.keys(updates).length > 0) {
      await saveMutation.mutateAsync(updates);
    }
  };

  return {
    miningData: miningData || {
      ...DEFAULT_MINING_DATA,
      id: '',
      user_id: user?.id || '',
      created_at: '',
      updated_at: '',
    } as MiningData,
    isLoading,
    error,
    addMinedBlock,
    exchangeHashrate,
    toggleMining,
    updateThrottle,
    loadMiningData,
    saveMiningData,
  };
};
