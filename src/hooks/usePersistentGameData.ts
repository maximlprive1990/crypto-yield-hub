import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface GameDataState {
  clickerLevel: number;
  clickerExperience: number;
  totalClicks: number;
  faucetClaims: number;
  totalSpins: number;
  miningLevel: number;
  miningExperience: number;
  farmingLevel: number;
  farmingExperience: number;
  diamonds: number;
  experience: number;
  lastDailyBonus: string | null;
  consecutiveDays: number;
}

export const usePersistentGameData = () => {
  const { user } = useAuth();
  const [gameData, setGameData] = useState<GameDataState>({
    clickerLevel: 1,
    clickerExperience: 0,
    totalClicks: 0,
    faucetClaims: 0,
    totalSpins: 0,
    miningLevel: 1,
    miningExperience: 0,
    farmingLevel: 1,
    farmingExperience: 0,
    diamonds: 0,
    experience: 0,
    lastDailyBonus: null,
    consecutiveDays: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données de farming depuis Supabase
  const loadGameData = useCallback(async () => {
    if (!user) return;

    try {
      // Charger les données de farming
      const { data: farmingData, error: farmingError } = await supabase
        .from('farming_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (farmingError && farmingError.code !== 'PGRST116') {
        console.error('Erreur lors du chargement des données de farming:', farmingError);
      }

      // Charger les données de profil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erreur lors du chargement des données de profil:', profileError);
      }

      // Charger les statistiques de spin
      const { data: spinData, error: spinError } = await supabase
        .from('user_spin_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (spinError && spinError.code !== 'PGRST116') {
        console.error('Erreur lors du chargement des données de spin:', spinError);
      }

      // Charger les réclamations de faucet
      const { data: faucetData, error: faucetError } = await supabase
        .from('faucet_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });

      if (faucetError) {
        console.error('Erreur lors du chargement des données de faucet:', faucetError);
      }

      // Assembler les données
      setGameData({
        clickerLevel: 1, // À calculer depuis l'expérience
        clickerExperience: profileData?.experience_points || 0,
        totalClicks: 0, // À ajouter comme nouvelle colonne si nécessaire
        faucetClaims: faucetData?.length || 0,
        totalSpins: spinData?.total_spins || 0,
        miningLevel: profileData?.hashrate_level || 1,
        miningExperience: profileData?.experience_points || 0,
        farmingLevel: 1, // À calculer depuis l'expérience de farming
        farmingExperience: farmingData?.experience || 0,
        diamonds: farmingData?.diamonds || 0,
        experience: farmingData?.experience || 0,
        lastDailyBonus: null, // À implémenter
        consecutiveDays: profileData?.loyalty_days || 0,
      });

    } catch (error) {
      console.error('Erreur lors du chargement des données de jeu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Sauvegarder les données de gaming
  const saveGameData = useCallback(async (updates: Partial<GameDataState>) => {
    if (!user) return false;

    try {
      // Mettre à jour les données de farming si nécessaire
      if (updates.farmingExperience !== undefined || updates.diamonds !== undefined) {
        const { error: farmingError } = await supabase
          .from('farming_data')
          .upsert({
            user_id: user.id,
            experience: updates.farmingExperience || gameData.farmingExperience,
            diamonds: updates.diamonds || gameData.diamonds,
            deadspot_coins: 0, // À synchroniser avec le système principal
            zero_tokens: 0,
          });

        if (farmingError) {
          console.error('Erreur lors de la sauvegarde des données de farming:', farmingError);
        }
      }

      // Mettre à jour les données de profil si nécessaire
      if (updates.miningExperience !== undefined || updates.clickerExperience !== undefined) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            experience_points: updates.miningExperience || updates.clickerExperience || gameData.experience,
            hashrate_level: updates.miningLevel || gameData.miningLevel,
            loyalty_days: updates.consecutiveDays || gameData.consecutiveDays,
          })
          .eq('user_id', user.id);

        if (profileError) {
          console.error('Erreur lors de la sauvegarde des données de profil:', profileError);
        }
      }

      // Mettre à jour l'état local
      setGameData(prev => ({ ...prev, ...updates }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données de jeu:', error);
      toast.error('Erreur lors de la sauvegarde des données de jeu');
      return false;
    }
  }, [user, gameData]);

  // Ajouter de l'expérience
  const addExperience = useCallback(async (amount: number, type: 'mining' | 'farming' | 'clicker') => {
    const updates: Partial<GameDataState> = {};
    
    switch (type) {
      case 'mining':
        updates.miningExperience = gameData.miningExperience + amount;
        // Calculer le niveau (exemple: niveau = sqrt(experience / 100))
        updates.miningLevel = Math.floor(Math.sqrt(updates.miningExperience / 100)) + 1;
        break;
      case 'farming':
        updates.farmingExperience = gameData.farmingExperience + amount;
        updates.farmingLevel = Math.floor(Math.sqrt(updates.farmingExperience / 100)) + 1;
        break;
      case 'clicker':
        updates.clickerExperience = gameData.clickerExperience + amount;
        updates.clickerLevel = Math.floor(Math.sqrt(updates.clickerExperience / 100)) + 1;
        break;
    }

    return await saveGameData(updates);
  }, [gameData, saveGameData]);

  // Ajouter des diamants
  const addDiamonds = useCallback(async (amount: number) => {
    return await saveGameData({ diamonds: gameData.diamonds + amount });
  }, [gameData.diamonds, saveGameData]);

  // Incrémenter les clics
  const incrementClicks = useCallback(async (amount: number = 1) => {
    return await saveGameData({ totalClicks: gameData.totalClicks + amount });
  }, [gameData.totalClicks, saveGameData]);

  // Incrémenter les spins
  const incrementSpins = useCallback(async (amount: number = 1) => {
    // Mettre à jour directement la table user_spin_status
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_spin_status')
        .upsert({
          user_id: user.id,
          total_spins: gameData.totalSpins + amount,
        });

      if (error) {
        console.error('Erreur lors de la mise à jour des spins:', error);
        return false;
      }

      setGameData(prev => ({ ...prev, totalSpins: prev.totalSpins + amount }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des spins:', error);
      return false;
    }
  }, [user, gameData.totalSpins]);

  // Charger les données au démarrage
  useEffect(() => {
    loadGameData();
  }, [loadGameData]);

  return {
    gameData,
    isLoading,
    saveGameData,
    addExperience,
    addDiamonds,
    incrementClicks,
    incrementSpins,
    loadGameData,
  };
};