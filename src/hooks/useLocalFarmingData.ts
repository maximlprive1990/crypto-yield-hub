import { useState, useEffect } from 'react';
import { useLocalAuth } from './useLocalAuth';

interface FarmingState {
  deadspotCoins: number;
  zeroTokens: number;
  diamonds: number;
  energy: number;
  maxEnergy: number;
  experience: number;
  miningExperience: number;
  miningExp: number; // Alias for compatibility
  miningLevel: number;
  level: number; // Alias for compatibility
}

const defaultState: FarmingState = {
  deadspotCoins: 500,
  zeroTokens: 0,
  diamonds: 0,
  energy: 1000,
  maxEnergy: 1000,
  experience: 0,
  miningExperience: 0,
  miningExp: 0,
  miningLevel: 1,
  level: 1
};

export const useLocalFarmingData = () => {
  const [state, setState] = useState<FarmingState>(defaultState);
  const [loading, setLoading] = useState(false);
  const { user } = useLocalAuth();

  const getStorageKey = () => user ? `farmingData_${user.id}` : null;

  const load = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const storageKey = getStorageKey();
      if (storageKey) {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const data = JSON.parse(stored);
          setState({
            ...defaultState,
            ...data,
            // Ensure aliases are synced
            miningExp: data.miningExperience || data.miningExp || 0,
            level: data.miningLevel || data.level || 1
          });
        } else {
          setState(defaultState);
          localStorage.setItem(storageKey, JSON.stringify(defaultState));
        }
      }
    } catch (error) {
      console.error('Error loading farming data:', error);
      setState(defaultState);
    } finally {
      setLoading(false);
    }
  };

  const savePartial = async (updates: Partial<FarmingState>) => {
    if (!user) return;
    
    const storageKey = getStorageKey();
    if (storageKey) {
      const newState = { 
        ...state, 
        ...updates,
        // Keep aliases in sync
        miningExp: updates.miningExperience ?? updates.miningExp ?? state.miningExp,
        level: updates.miningLevel ?? updates.level ?? state.level
      };
      setState(newState);
      localStorage.setItem(storageKey, JSON.stringify(newState));
    }
  };

  const addDeadspot = (amount: number) => {
    savePartial({ deadspotCoins: state.deadspotCoins + amount });
  };

  const addZero = (amount: number) => {
    savePartial({ zeroTokens: state.zeroTokens + amount });
  };

  const addDiamonds = (amount: number) => {
    savePartial({ diamonds: state.diamonds + amount });
  };

  const changeEnergy = (delta: number) => {
    const newEnergy = Math.max(0, Math.min(state.maxEnergy, state.energy + delta));
    savePartial({ energy: newEnergy });
  };

  const increaseMaxEnergy = (delta: number) => {
    const newMaxEnergy = state.maxEnergy + delta;
    const newEnergy = Math.min(newMaxEnergy, state.energy + delta);
    savePartial({ maxEnergy: newMaxEnergy, energy: newEnergy });
  };

  useEffect(() => {
    if (user) {
      load();
    } else {
      setState(defaultState);
    }
  }, [user]);

  return {
    state,
    loading,
    load,
    savePartial,
    addDeadspot,
    addZero,
    addDiamonds,
    changeEnergy,
    increaseMaxEnergy
  };
};
