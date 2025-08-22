import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useMiningPersistence } from './useMiningPersistence';
import { usePersistentGameData } from './usePersistentGameData';
import { useTransactionHistory } from './useTransactionHistory';
import { toast } from 'sonner';

/**
 * Hook central pour gérer toute la persistance des données du site
 * Synchronise automatiquement toutes les données importantes avec Supabase
 */
export const useAllDataPersistence = () => {
  const { user } = useAuth();
  const miningPersistence = useMiningPersistence();
  const gameDataPersistence = usePersistentGameData();
  const transactionHistory = useTransactionHistory();

  // Synchronisation périodique automatique (toutes les 5 minutes)
  const autoSync = useCallback(async () => {
    if (!user) return;

    try {
      // Recharger toutes les données depuis Supabase
      await Promise.all([
        miningPersistence.loadMiningData(),
        gameDataPersistence.loadGameData(),
        transactionHistory.loadTransactions(),
      ]);

      console.log('✅ Synchronisation automatique réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation automatique:', error);
    }
  }, [user, miningPersistence, gameDataPersistence, transactionHistory]);

  // Sauvegarde d'urgence (avant fermeture de page)
  const emergencyBackup = useCallback(async () => {
    if (!user) return;

    try {
      // Sauvegarder les données critiques en cours
      await Promise.all([
        miningPersistence.saveMiningData({}), // Sauvegarde l'état actuel
        gameDataPersistence.saveGameData({}), // Sauvegarde l'état actuel
      ]);

      console.log('✅ Sauvegarde d\'urgence réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde d\'urgence:', error);
    }
  }, [user, miningPersistence, gameDataPersistence]);

  // Vérification de l'intégrité des données
  const verifyDataIntegrity = useCallback(async () => {
    if (!user) return true;

    try {
      // Vérifier que toutes les tables essentielles existent pour l'utilisateur
      const checks = await Promise.all([
        supabase.from('profiles').select('id').eq('user_id', user.id).single(),
        supabase.from('mining_data').select('id').eq('user_id', user.id).maybeSingle(),
        
      ]);

      // Créer les données manquantes
      const [profileCheck, miningCheck] = checks;

      if (profileCheck.error) {
        console.log('🔧 Création du profil utilisateur manquant');
        await supabase.from('profiles').insert({
          user_id: user.id,
          username: user.email?.split('@')[0] || 'user',
        });
      }

      if (!miningCheck.data) {
        console.log('🔧 Création des données de mining manquantes');
        await supabase.from('mining_data').insert({
          user_id: user.id,
        });
      }


      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'intégrité:', error);
      toast.error('Erreur lors de la vérification des données');
      return false;
    }
  }, [user]);

  // Exportation complète des données utilisateur
  const exportUserData = useCallback(async () => {
    if (!user) return null;

    try {
      const userData = {
        user_id: user.id,
        export_date: new Date().toISOString(),
        profile: null,
        mining_data: null,
        farmingData: null,
        transactions: [],
        sessions: [],
        achievements: [],
      };

      // Récupérer toutes les données
      const [
        profileData,
        miningData,
        deposits,
        withdrawals,
        miningBlocks,
        spinResults,
        faucetClaims,
        miningSessions,
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('mining_data').select('*').eq('user_id', user.id).single(),
        supabase.from('deposits').select('*').eq('user_id', user.id),
        supabase.from('withdrawal_requests').select('*').eq('user_id', user.id),
        supabase.from('mining_blocks').select('*').eq('user_id', user.id),
        supabase.from('spin_results').select('*').eq('user_id', user.id),
        supabase.from('faucet_claims').select('*').eq('user_id', user.id),
        supabase.from('mining_sessions').select('*').eq('user_id', user.id),
      ]);

      userData.profile = profileData.data;
      userData.mining_data = miningData.data;
      
      userData.transactions = [
        ...(deposits.data || []),
        ...(withdrawals.data || []),
        ...(spinResults.data || []),
        ...(faucetClaims.data || []),
      ];
      userData.sessions = [
        ...(miningBlocks.data || []),
        ...(miningSessions?.data || []),
      ];

      return userData;
    } catch (error) {
      console.error('❌ Erreur lors de l\'exportation:', error);
      toast.error('Erreur lors de l\'exportation des données');
      return null;
    }
  }, [user]);

  // Statistiques globales de l'utilisateur
  const getUserStats = useCallback(async () => {
    if (!user) return null;

    try {
      const stats = {
        total_deadspot_earned: 0,
        total_hashrate_mined: 0,
        total_blocks_mined: 0,
        total_transactions: 0,
        account_age_days: 0,
        last_activity: null,
      };

      // Calculer les statistiques depuis la base de données
      const [
        profileData,
        miningData,
        transactionCount,
        miningBlocks,
      ] = await Promise.all([
        supabase.from('profiles').select('deadspot_tokens, created_at').eq('user_id', user.id).single(),
        supabase.from('mining_data').select('*').eq('user_id', user.id).single(),
        supabase.from('hashrate_exchanges').select('deadspot_coins_received').eq('user_id', user.id),
        supabase.from('mining_blocks').select('block_reward').eq('user_id', user.id),
      ]);

      if (profileData.data) {
        stats.total_deadspot_earned = Number(profileData.data.deadspot_tokens || 0);
        stats.account_age_days = Math.floor(
          (Date.now() - new Date(profileData.data.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
      }

      if (miningData.data) {
        stats.total_hashrate_mined = Number(miningData.data.total_hashrate_earned || 0);
        stats.total_blocks_mined = miningData.data.total_blocks_mined || 0;
        stats.last_activity = miningData.data.updated_at;
      }

      stats.total_transactions = (transactionCount.data || []).length;

      return stats;
    } catch (error) {
      console.error('❌ Erreur lors du calcul des statistiques:', error);
      return null;
    }
  }, [user]);

  // Configuration de la synchronisation automatique
  useEffect(() => {
    if (!user) return;

    // Vérifier l'intégrité des données au démarrage
    verifyDataIntegrity();

    // Synchronisation automatique toutes les 5 minutes
    const syncInterval = setInterval(autoSync, 5 * 60 * 1000);

    // Sauvegarde avant fermeture de page
    const handleBeforeUnload = () => {
      emergencyBackup();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, autoSync, emergencyBackup, verifyDataIntegrity]);

  // État de chargement global
  const isLoading = 
    miningPersistence.isLoading || 
    gameDataPersistence.isLoading || 
    transactionHistory.isLoading;

  return {
    // Données
    miningData: miningPersistence.miningData,
    gameData: gameDataPersistence.gameData,
    transactions: transactionHistory.transactions,
    
    // États
    isLoading,
    
    // Actions de persistence
    miningActions: {
      addMinedBlock: miningPersistence.addMinedBlock,
      exchangeHashrate: miningPersistence.exchangeHashrate,
      toggleMining: miningPersistence.toggleMining,
      updateThrottle: miningPersistence.updateThrottle,
    },
    
    gameActions: {
      addExperience: gameDataPersistence.addExperience,
      addDiamonds: gameDataPersistence.addDiamonds,
      incrementClicks: gameDataPersistence.incrementClicks,
      incrementSpins: gameDataPersistence.incrementSpins,
    },
    
    // Utilitaires
    autoSync,
    emergencyBackup,
    verifyDataIntegrity,
    exportUserData,
    getUserStats,
    transactionStats: transactionHistory.getTransactionStats(),
  };
};