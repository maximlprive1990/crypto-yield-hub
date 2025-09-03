import { useState } from 'react';
import { useLocalAuth } from './useLocalAuth';
import { useLocalFarmingData } from './useLocalFarmingData';
import { useLocalMiningPersistence } from './useLocalMiningPersistence';

export const useLocalAllDataPersistence = () => {
  const { user } = useLocalAuth();
  const { state: farmingData } = useLocalFarmingData();
  const { miningData } = useLocalMiningPersistence();
  const [isLoading] = useState(false);

  const autoSync = async () => {
    // Local storage auto-syncs, no need for manual sync
    console.log('Data auto-synced locally');
  };

  const emergencyBackup = async () => {
    if (!user) return;
    
    const backup = {
      userId: user.id,
      farmingData,
      miningData,
      timestamp: new Date().toISOString()
    };
    
    // Store backup in localStorage with timestamp
    localStorage.setItem(`backup_${user.id}_${Date.now()}`, JSON.stringify(backup));
    console.log('Emergency backup created');
  };

  const exportUserData = () => {
    if (!user) return null;
    
    return {
      user: user,
      farmingData: farmingData,
      miningData: miningData,
      transactions: [], // No transactions in local mode
      exportDate: new Date().toISOString()
    };
  };

  const getUserStats = async () => {
    if (!user) return null;
    
    const accountCreated = new Date(user.created_at);
    const now = new Date();
    const accountAgeMs = now.getTime() - accountCreated.getTime();
    const accountAgeDays = Math.floor(accountAgeMs / (1000 * 60 * 60 * 24));
    
    return {
      account_age_days: accountAgeDays,
      total_mining_sessions: miningData?.total_blocks_mined || 0,
      total_earnings: farmingData.deadspotCoins + farmingData.zeroTokens,
      user_level: farmingData.level || 1,
      experience_points: farmingData.experience || 0
    };
  };

  const transactionStats = {
    totalDeposits: 0,
    totalWithdrawals: 0,
    avgTransactionAmount: 0,
    totalTransactions: 0
  };

  return {
    isLoading,
    miningData: farmingData,
    gameData: farmingData,
    transactions: [],
    miningActions: {
      saveData: () => Promise.resolve(),
      loadData: () => Promise.resolve()
    },
    gameActions: {
      savePartial: () => Promise.resolve(),
      load: () => Promise.resolve()
    },
    autoSync,
    emergencyBackup,
    exportUserData,
    getUserStats,
    transactionStats
  };
};