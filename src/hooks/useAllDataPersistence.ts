
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { useMiningPersistence } from './useMiningPersistence';
import { usePersistentGameData } from './usePersistentGameData';
import { useTransactionHistory } from './useTransactionHistory';

export const useAllDataPersistence = () => {
  const { user } = useAuth();
  const miningPersistence = useMiningPersistence();
  const gameDataPersistence = usePersistentGameData();
  const transactionHistory = useTransactionHistory();

  // Synchronisation manuelle
  const autoSync = useCallback(async () => {
    if (!user) return;

    try {
      await Promise.all([
        miningPersistence.loadMiningData(),
        gameDataPersistence.loadGameData(),
        transactionHistory.loadTransactions(),
      ]);
      console.log('✅ Synchronisation réussie');
    } catch (error) {
      console.error('❌ Erreur synchronisation:', error);
    }
  }, [user, miningPersistence, gameDataPersistence, transactionHistory]);

  // Sauvegarde d'urgence
  const emergencyBackup = useCallback(async () => {
    if (!user) return;

    try {
      await Promise.all([
        miningPersistence.saveMiningData({}),
        gameDataPersistence.saveGameData({}),
      ]);
      console.log('✅ Sauvegarde réussie');
    } catch (error) {
      console.error('❌ Erreur sauvegarde:', error);
    }
  }, [user, miningPersistence, gameDataPersistence]);

  // Exportation des données
  const exportUserData = useCallback(async () => {
    if (!user) return null;

    try {
      const userData = {
        user_id: user.id,
        export_date: new Date().toISOString(),
        mining_data: miningPersistence.miningData,
        game_data: gameDataPersistence.gameData,
        transactions: transactionHistory.transactions,
      };

      return userData;
    } catch (error) {
      console.error('❌ Erreur exportation:', error);
      return null;
    }
  }, [user, miningPersistence.miningData, gameDataPersistence.gameData, transactionHistory.transactions]);

  // Statistiques utilisateur
  const getUserStats = useCallback(async () => {
    if (!user) return null;

    return {
      total_deadspot_earned: miningPersistence.miningData.deadspot_coins,
      total_hashrate_mined: miningPersistence.miningData.total_hashrate_earned,
      total_blocks_mined: miningPersistence.miningData.total_blocks_mined,
      total_transactions: transactionHistory.transactions.length,
      account_age_days: Math.floor((Date.now() - new Date(user.created_at || '').getTime()) / (1000 * 60 * 60 * 24)),
      last_activity: miningPersistence.miningData.updated_at,
    };
  }, [user, miningPersistence.miningData, transactionHistory.transactions]);

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
    
    // Actions
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
    exportUserData,
    getUserStats,
    transactionStats: transactionHistory.getTransactionStats(),
  };
};
