import { useState, useEffect } from 'react';
import { useLocalAuth } from './useLocalAuth';

interface MiningData {
  accumulated_hashrate: number;
  deadspot_coins: number;
  total_blocks_mined: number;
  total_hashrate_earned: number;
  current_mining_session_start: string | null;
  is_currently_mining: boolean;
  mining_throttle: number;
}

const defaultMiningData: MiningData = {
  accumulated_hashrate: 0,
  deadspot_coins: 0,
  total_blocks_mined: 0,
  total_hashrate_earned: 0,
  current_mining_session_start: null,
  is_currently_mining: false,
  mining_throttle: 0.5
};

export const useLocalMiningPersistence = () => {
  const [miningData, setMiningData] = useState<MiningData | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useLocalAuth();

  const getStorageKey = () => user ? `miningData_${user.id}` : null;

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const storageKey = getStorageKey();
      if (storageKey) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          setMiningData(JSON.parse(stored));
        } else {
          setMiningData(defaultMiningData);
          localStorage.setItem(storageKey, JSON.stringify(defaultMiningData));
        }
      }
    } catch (error) {
      console.error('Error loading mining data:', error);
      setMiningData(defaultMiningData);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (data: Partial<MiningData>) => {
    if (!user || !miningData) return;
    
    const storageKey = getStorageKey();
    if (storageKey) {
      const newData = { ...miningData, ...data };
      setMiningData(newData);
      localStorage.setItem(storageKey, JSON.stringify(newData));
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setMiningData(null);
    }
  }, [user]);

  return {
    miningData,
    loading,
    saveData,
    loadData
  };
};