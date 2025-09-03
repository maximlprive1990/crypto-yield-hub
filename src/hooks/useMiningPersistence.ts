
import { useState, useEffect } from 'react';
import { useLocalAuth } from './useLocalAuth';
import { toast } from 'sonner';

export interface MiningData {
  id?: string;
  user_id?: string;
  accumulated_hashrate: number;
  deadspot_coins: number;
  is_currently_mining: boolean;
  mining_throttle: number;
  last_block_time: string | null;
  total_hashrate_earned: number;
  total_blocks_mined: number;
  current_mining_session_start: string | null;
  created_at?: string;
  updated_at?: string;
}

const DEFAULT_MINING_DATA: MiningData = {
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
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useLocalAuth();

  const getStorageKey = () => user ? `miningData_${user.id}` : null;

  const loadMiningData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const storageKey = getStorageKey();
      if (storageKey) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setMiningData(JSON.parse(stored));
        } else {
          setMiningData(DEFAULT_MINING_DATA);
          localStorage.setItem(storageKey, JSON.stringify(DEFAULT_MINING_DATA));
        }
      }
    } catch (error) {
      console.error('Error loading mining data:', error);
      setMiningData(DEFAULT_MINING_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMiningData = async (updates: Partial<MiningData>) => {
    if (!user || !miningData) return;
    
    const storageKey = getStorageKey();
    if (storageKey && Object.keys(updates).length > 0) {
      const newData = { ...miningData, ...updates };
      setMiningData(newData);
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }
  };

  useEffect(() => {
    if (user) {
      loadMiningData();
    } else {
      setMiningData(null);
    }
  }, [user]);

  // Ajouter un bloc miné
  const addMinedBlock = async (blockReward: number, currentHashrate: number) => {
    if (!miningData) return false;

    try {
      await saveMiningData({
        accumulated_hashrate: miningData.accumulated_hashrate + currentHashrate,
        total_hashrate_earned: miningData.total_hashrate_earned + currentHashrate,
        total_blocks_mined: miningData.total_blocks_mined + 1,
        last_block_time: new Date().toISOString(),
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
      await saveMiningData({
        accumulated_hashrate: miningData.accumulated_hashrate - totalHashrateToExchange,
        deadspot_coins: miningData.deadspot_coins + coinsEarned,
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

      await saveMiningData(updates);
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
      await saveMiningData({
        mining_throttle: newThrottle,
      });
      return true;
    } catch (error) {
      console.error('Error updating throttle:', error);
      return false;
    }
  };

  return {
    miningData: miningData || DEFAULT_MINING_DATA,
    isLoading,
    error: null,
    addMinedBlock,
    exchangeHashrate,
    toggleMining,
    updateThrottle,
    loadMiningData,
    saveMiningData,
  };
};
