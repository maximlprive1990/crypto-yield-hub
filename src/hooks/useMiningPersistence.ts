
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MiningData {
  accumulated_hashrate: number;
  deadspot_coins: number;
  is_currently_mining: boolean;
  mining_throttle: number;
  last_block_time: string | null;
}

export const useMiningPersistence = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [miningData, setMiningData] = useState<MiningData>({
    accumulated_hashrate: 0,
    deadspot_coins: 0,
    is_currently_mining: false,
    mining_throttle: 0.7,
    last_block_time: null
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch mining data
  useEffect(() => {
    const fetchMiningData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('mining_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching mining data:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          setMiningData({
            accumulated_hashrate: data.accumulated_hashrate || 0,
            deadspot_coins: data.deadspot_coins || 0,
            is_currently_mining: data.is_currently_mining || false,
            mining_throttle: data.mining_throttle || 0.7,
            last_block_time: data.last_block_time
          });
        }
      } catch (error) {
        console.error('Error in fetchMiningData:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMiningData();
  }, [user]);

  const addMinedBlock = async (hashrate: number, currentHashrate: number): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('mining_stats')
        .upsert({
          user_id: user.id,
          accumulated_hashrate: (miningData.accumulated_hashrate || 0) + hashrate,
          deadspot_coins: miningData.deadspot_coins,
          is_currently_mining: miningData.is_currently_mining,
          mining_throttle: miningData.mining_throttle,
          last_block_time: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (!error) {
        setMiningData(prev => ({
          ...prev,
          accumulated_hashrate: (prev.accumulated_hashrate || 0) + hashrate,
          last_block_time: new Date().toISOString()
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

    const deadspotReward = (hashrateAmount / 100000) * 0.15;

    try {
      const { error } = await supabase
        .from('mining_stats')
        .update({
          accumulated_hashrate: miningData.accumulated_hashrate - hashrateAmount,
          deadspot_coins: miningData.deadspot_coins + deadspotReward
        })
        .eq('user_id', user.id);

      if (!error) {
        setMiningData(prev => ({
          ...prev,
          accumulated_hashrate: prev.accumulated_hashrate - hashrateAmount,
          deadspot_coins: prev.deadspot_coins + deadspotReward
        }));

        toast({
          title: "Échange réussi!",
          description: `${hashrateAmount.toLocaleString()} hashrate échangés contre ${deadspotReward.toFixed(2)} DeadSpot coins`
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

    try {
      const { error } = await supabase
        .from('mining_stats')
        .upsert({
          user_id: user.id,
          accumulated_hashrate: miningData.accumulated_hashrate,
          deadspot_coins: miningData.deadspot_coins,
          is_currently_mining: newState,
          mining_throttle: miningData.mining_throttle,
          last_block_time: miningData.last_block_time
        }, {
          onConflict: 'user_id'
        });

      if (!error) {
        setMiningData(prev => ({
          ...prev,
          is_currently_mining: newState
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
        .from('mining_stats')
        .upsert({
          user_id: user.id,
          accumulated_hashrate: miningData.accumulated_hashrate,
          deadspot_coins: miningData.deadspot_coins,
          is_currently_mining: miningData.is_currently_mining,
          mining_throttle: newThrottle,
          last_block_time: miningData.last_block_time
        }, {
          onConflict: 'user_id'
        });

      if (!error) {
        setMiningData(prev => ({
          ...prev,
          mining_throttle: newThrottle
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
    addMinedBlock,
    exchangeHashrate,
    toggleMining,
    updateThrottle
  };
};
