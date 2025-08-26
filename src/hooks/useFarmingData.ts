import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FarmingState {
  deadspotCoins: number;
  zeroTokens: number;
  diamonds: number;
  energy: number;
  maxEnergy: number;
  miningExperience: number;
  miningLevel: number;
  miningExp: number;
  level: number;
}

export const useFarmingData = () => {
  const [state, setState] = useState<FarmingState>({
    deadspotCoins: 0,
    zeroTokens: 0,
    diamonds: 0,
    energy: 1000,
    maxEnergy: 1000,
    miningExperience: 0,
    miningLevel: 1,
    miningExp: 0,
    level: 1,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    const uid = auth?.user?.id ?? null;
    setUserId(uid);
    if (!uid) {
      setLoading(false);
      return;
    }

    // Try fetch
    const { data, error } = await supabase
      .from('farming_data')
      .select('*')
      .eq('user_id', uid)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur chargement farming_data:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      // create initial row
      const { error: insertErr } = await supabase.from('farming_data').insert({
        user_id: uid,
      });
      if (insertErr) {
        console.error('Erreur création farming_data:', insertErr);
        setLoading(false);
        return;
      }
      // refetch
      const { data: created } = await supabase
        .from('farming_data')
        .select('*')
        .eq('user_id', uid)
        .single();
      if (created) {
        setState({
          deadspotCoins: Number(created.deadspot_coins ?? 0),
          zeroTokens: Number(created.zero_tokens ?? 0),
          diamonds: Number(created.diamonds ?? 0),
          energy: Number(created.energy ?? 1000),
          maxEnergy: Number(created.max_energy ?? 1000),
          miningExperience: Number(created.mining_experience ?? 0),
          miningLevel: Number(created.mining_level ?? 1),
          miningExp: Number(created.mining_experience ?? 0),
          level: Number(created.mining_level ?? 1),
        });
      }
      setLoading(false);
      return;
    }

    setState({
      deadspotCoins: Number(data.deadspot_coins ?? 0),
      zeroTokens: Number(data.zero_tokens ?? 0),
      diamonds: Number(data.diamonds ?? 0),
      energy: Number(data.energy ?? 1000),
      maxEnergy: Number(data.max_energy ?? 1000),
      miningExperience: Number(data.mining_experience ?? 0),
      miningLevel: Number(data.mining_level ?? 1),
      miningExp: Number(data.mining_experience ?? 0),
      level: Number(data.mining_level ?? 1),
    });
    setLoading(false);
  }, []);

  const savePartial = useCallback(
    async (updates: Partial<FarmingState>) => {
      if (!userId) return false;
      const payload: any = {};
      if (updates.deadspotCoins !== undefined) payload.deadspot_coins = updates.deadspotCoins;
      if (updates.zeroTokens !== undefined) payload.zero_tokens = updates.zeroTokens;
      if (updates.diamonds !== undefined) payload.diamonds = updates.diamonds;
      if (updates.energy !== undefined) payload.energy = updates.energy;
      if (updates.maxEnergy !== undefined) payload.max_energy = updates.maxEnergy;
      if (updates.miningExperience !== undefined) payload.mining_experience = updates.miningExperience;
      if (updates.miningLevel !== undefined) payload.mining_level = updates.miningLevel;

      const { error } = await supabase
        .from('farming_data')
        .update(payload)
        .eq('user_id', userId);
      if (error) {
        console.error('Erreur sauvegarde farming_data:', error);
        return false;
      }
      setState(prev => ({ ...prev, ...updates }));
      return true;
    },
    [userId]
  );

  const addDeadspot = useCallback((amount: number) => {
    return savePartial({ deadspotCoins: Math.max(0, state.deadspotCoins + amount) });
  }, [savePartial, state.deadspotCoins]);

  const addZero = useCallback((amount: number) => {
    return savePartial({ zeroTokens: Math.max(0, state.zeroTokens + amount) });
  }, [savePartial, state.zeroTokens]);

  const addDiamonds = useCallback((amount: number) => {
    return savePartial({ diamonds: Math.max(0, state.diamonds + amount) });
  }, [savePartial, state.diamonds]);

  const changeEnergy = useCallback((delta: number) => {
    const newEnergy = Math.min(state.maxEnergy, Math.max(0, state.energy + delta));
    return savePartial({ energy: newEnergy });
  }, [savePartial, state.energy, state.maxEnergy]);

  const increaseMaxEnergy = useCallback((delta: number) => {
    const newMax = Math.max(0, state.maxEnergy + delta);
    const newEnergy = Math.min(newMax, state.energy + delta);
    return savePartial({ maxEnergy: newMax, energy: newEnergy });
  }, [savePartial, state.maxEnergy, state.energy]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state,
    loading,
    reload: load,
    savePartial,
    addDeadspot,
    addZero,
    addDiamonds,
    changeEnergy,
    increaseMaxEnergy,
  };
};
