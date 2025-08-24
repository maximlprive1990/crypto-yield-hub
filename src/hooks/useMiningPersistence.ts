
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MiningData {
  accumulated_hashrate: number;
  deadspot_coins: number;
  is_currently_mining: boolean;
  mining_throttle: number;
  // Not stored in mining_data table, kept locally for convenience
  last_block_time: string | null;

  // Fields present in mining_data table and used by the dashboard
  total_hashrate_earned: number;
  total_blocks_mined: number;
  current_mining_session_start: string | null;
}

export const useMiningPersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [miningData, setMiningData] = useState<MiningData>({
    accumulated_hashrate: 0,
    deadspot_coins: 0,
    is_currently_mining: false,
    mining_throttle: 0.7,
    last_block_time: null,
    total_hashrate_earned: 0,
    total_blocks_mined: 0,
    current_mining_session_start: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Internal loader that we can reuse
  const loadMiningData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('mining_data')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching mining data:', error);
        setIsLoading(false);
        return false;
      }

      if (data) {
        setMiningData({
          accumulated_hashrate: Number(data.accumulated_hashrate ?? 0),
          deadspot_coins: Number(data.deadspot_coins ?? 0),
          is_currently_mining: Boolean(data.is_currently_mining ?? false),
          mining_throttle: Number(data.mining_throttle ?? 0.7),
          last_block_time: null, // not persisted in mining_data
          total_hashrate_earned: Number(data.total_hashrate_earned ?? 0),
          total_blocks_mined: Number(data.total_blocks_mined ?? 0),
          current_mining_session_start: data.current_mining_session_start ?? null,
        });
      }
      return true;
    } catch (error) {
      console.error('Error in loadMiningData:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMiningData();
  }, [loadMiningData]);

  const saveMiningData = useCallback(
    async (partial: Partial<MiningData>): Promise<boolean> => {
      if (!user) return false;

      // Compose the row to upsert using current state + overrides
      const snapshot = { ...miningData, ...partial };

      try {
        const { error } = await supabase
          .from('mining_data')
          .upsert(
            {
              user_id: user.id,
              accumulated_hashrate: Number(snapshot.accumulated_hashrate ?? 0),
              deadspot_coins: Number(snapshot.deadspot_coins ?? 0),
              is_currently_mining: Boolean(snapshot.is_currently_mining ?? false),
              mining_throttle: Number(snapshot.mining_throttle ?? 0.7),
              total_hashrate_earned: Number(snapshot.total_hashrate_earned ?? 0),
              total_blocks_mined: Number(snapshot.total_blocks_mined ?? 0),
              current_mining_session_start: snapshot.current_mining_session_start ?? null,
            },
            { onConflict: 'user_id' }
          );

        if (!error) {
          setMiningData(snapshot);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error in saveMiningData:', error);
        return false;
      }
    },
    [user, miningData]
  );

  const addMinedBlock = async (hashrate: number, currentHashrate: number): Promise<boolean> => {
    if (!user) return false;

    // We only update aggregated counters in mining_data here (simple & minimal).
    const next = {
      accumulated_hashrate: (miningData.accumulated_hashrate || 0) + hashrate,
      total_hashrate_earned: (miningData.total_hashrate_earned || 0) + hashrate,
      total_blocks_mined: (miningData.total_blocks_mined || 0) + 1,
      last_block_time: new Date().toISOString(),
    };

    try {
      const { error } = await supabase
        .from('mining_data')
        .upsert(
          {
            user_id: user.id,
            accumulated_hashrate: next.accumulated_hashrate,
            deadspot_coins: miningData.deadspot_coins,
            is_currently_mining: miningData.is_currently_mining,
            mining_throttle: miningData.mining_throttle,
            total_hashrate_earned: next.total_hashrate_earned,
            total_blocks_mined: next.total_blocks_mined,
            current_mining_session_start: miningData.current_mining_session_start,
          },
          { onConflict: 'user_id' }
        );

      if (!error) {
        setMiningData((prev) => ({
          ...prev,
          accumulated_hashrate: next.accumulated_hashrate,
          total_hashrate_earned: next.total_hashrate_earned,
          total_blocks_mined: next.total_blocks_mined,
          last_block_time: next.last_block_time,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error adding mined block:', error);
      return false;
    }
  };

  const exchangeHashrate = async (hashrateAmount: number): Promise<boolean> => {
    if (!user || miningData.accumulated_hashrate < hashrateAmount) return false;

    // Exchange rate: 100,000 hashrate => 0.15 DSC
    const deadspotReward = (hashrateAmount / 100000) * 0.15;

    try {
      const { error } = await supabase
        .from('mining_data')
        .update({
          accumulated_hashrate: miningData.accumulated_hashrate - hashrateAmount,
          deadspot_coins: miningData.deadspot_coins + deadspotReward,
        })
        .eq('user_id', user.id);

      if (!error) {
        setMiningData((prev) => ({
          ...prev,
          accumulated_hashrate: prev.accumulated_hashrate - hashrateAmount,
          deadspot_coins: prev.deadspot_coins + deadspotReward,
        }));

        toast({
          title: 'Échange réussi!',
          description: `${hashrateAmount.toLocaleString()} hashrate échangés contre ${deadspotReward.toFixed(2)} DeadSpot coins`,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error exchanging hashrate:', error);
      return false;
    }
  };

  const toggleMining = async (newState: boolean): Promise<boolean> => {
    if (!user) return false;

    const nextSessionStart = newState ? new Date().toISOString() : null;

    try {
      const { error } = await supabase
        .from('mining_data')
        .upsert(
          {
            user_id: user.id,
            accumulated_hashrate: miningData.accumulated_hashrate,
            deadspot_coins: miningData.deadspot_coins,
            is_currently_mining: newState,
            mining_throttle: miningData.mining_throttle,
            total_hashrate_earned: miningData.total_hashrate_earned,
            total_blocks_mined: miningData.total_blocks_mined,
            current_mining_session_start: nextSessionStart,
          },
          { onConflict: 'user_id' }
        );

      if (!error) {
        setMiningData((prev) => ({
          ...prev,
          is_currently_mining: newState,
          current_mining_session_start: nextSessionStart,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error toggling mining:', error);
      return false;
    }
  };

  const updateThrottle = async (newThrottle: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('mining_data')
        .upsert(
          {
            user_id: user.id,
            accumulated_hashrate: miningData.accumulated_hashrate,
            deadspot_coins: miningData.deadspot_coins,
            is_currently_mining: miningData.is_currently_mining,
            mining_throttle: newThrottle,
            total_hashrate_earned: miningData.total_hashrate_earned,
            total_blocks_mined: miningData.total_blocks_mined,
            current_mining_session_start: miningData.current_mining_session_start,
          },
          { onConflict: 'user_id' }
        );

      if (!error) {
        setMiningData((prev) => ({
          ...prev,
          mining_throttle: newThrottle,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating throttle:', error);
      return false;
    }
  };

  return {
    miningData,
    isLoading,
    // Load/save helpers used by useAllDataPersistence
    loadMiningData,
    saveMiningData,

    // Actions
    addMinedBlock,
    exchangeHashrate,
    toggleMining,
    updateThrottle,
  };
};
