import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'exchange' | 'reward' | 'purchase' | 'spin' | 'faucet' | 'mining';
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'completed';
  description: string;
  created_at: string;
  metadata?: any;
}

export const useTransactionHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'historique des transactions
  const loadTransactions = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const allTransactions: Transaction[] = [];

      // Charger les dépôts crypto
      const { data: deposits } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (deposits) {
        deposits.forEach(deposit => {
          allTransactions.push({
            id: deposit.id,
            type: 'deposit',
            amount: Number(deposit.amount),
            currency: deposit.crypto_type,
            status: deposit.status as any,
            description: `Dépôt ${deposit.crypto_type}`,
            created_at: deposit.created_at,
            metadata: { transaction_id: deposit.transaction_id },
          });
        });
      }

      // Charger les retraits
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (withdrawals) {
        withdrawals.forEach(withdrawal => {
          allTransactions.push({
            id: withdrawal.id,
            type: 'withdrawal',
            amount: Number(withdrawal.amount),
            currency: withdrawal.currency,
            status: withdrawal.status as any,
            description: withdrawal.description || `Retrait ${withdrawal.currency}`,
            created_at: withdrawal.created_at,
          });
        });
      }

      // Charger les échanges de hashrate
      const { data: exchanges } = await supabase
        .from('hashrate_exchanges')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (exchanges) {
        exchanges.forEach(exchange => {
          allTransactions.push({
            id: exchange.id,
            type: 'exchange',
            amount: Number(exchange.deadspot_coins_received),
            currency: 'DSC',
            status: 'completed',
            description: `Échange ${Number(exchange.hashrate_amount).toLocaleString()} hashrate → ${Number(exchange.deadspot_coins_received)} DSC`,
            created_at: exchange.created_at,
            metadata: { hashrate_amount: exchange.hashrate_amount },
          });
        });
      }

      // Charger les résultats de spin
      const { data: spins } = await supabase
        .from('spin_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (spins) {
        spins.forEach(spin => {
          allTransactions.push({
            id: spin.id,
            type: 'spin',
            amount: Number(spin.prize_amount),
            currency: spin.prize_type,
            status: 'completed',
            description: `Gain de spin: ${Number(spin.prize_amount)} ${spin.prize_type}`,
            created_at: spin.created_at,
            metadata: { is_free_spin: spin.is_free_spin },
          });
        });
      }

      // Charger les réclamations de faucet
      const { data: faucetClaims } = await supabase
        .from('faucet_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('claimed_at', { ascending: false });

      if (faucetClaims) {
        faucetClaims.forEach(claim => {
          allTransactions.push({
            id: claim.id,
            type: 'faucet',
            amount: Number(claim.amount_claimed),
            currency: 'DSC',
            status: 'completed',
            description: `Réclamation faucet: ${Number(claim.amount_claimed)} DSC`,
            created_at: claim.claimed_at,
          });
        });
      }

      // Charger les blocs minés
      const { data: miningBlocks } = await supabase
        .from('mining_blocks')
        .select('*')
        .eq('user_id', user.id)
        .order('block_time', { ascending: false })
        .limit(50); // Limiter pour éviter trop de données

      if (miningBlocks) {
        miningBlocks.forEach(block => {
          allTransactions.push({
            id: block.id,
            type: 'mining',
            amount: Number(block.block_reward),
            currency: 'Hashrate',
            status: 'completed',
            description: `Bloc miné: +${Number(block.block_reward).toLocaleString()} hashrate`,
            created_at: block.block_time,
            metadata: { current_hashrate: block.current_hashrate },
          });
        });
      }

      // Charger les achats de coins
      const { data: coinPurchases } = await supabase
        .from('coin_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (coinPurchases) {
        coinPurchases.forEach(purchase => {
          allTransactions.push({
            id: purchase.id,
            type: 'purchase',
            amount: Number(purchase.amount_deadspot),
            currency: 'DSC',
            status: purchase.status as any,
            description: `Achat de ${Number(purchase.amount_deadspot)} DSC pour $${Number(purchase.amount_usd)}`,
            created_at: purchase.created_at,
            metadata: { amount_usd: purchase.amount_usd },
          });
        });
      }

      // Trier toutes les transactions par date
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Obtenir les statistiques des transactions
  const getTransactionStats = useCallback(() => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalSpinWins: 0,
      totalFaucetClaims: 0,
      totalMiningRewards: 0,
      totalExchanges: 0,
      pendingTransactions: 0,
      last30Days: 0,
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.created_at);
      
      if (transactionDate >= thirtyDaysAgo) {
        stats.last30Days++;
      }

      if (transaction.status === 'pending') {
        stats.pendingTransactions++;
      }

      switch (transaction.type) {
        case 'deposit':
          if (transaction.status === 'confirmed') {
            stats.totalDeposits += transaction.amount;
          }
          break;
        case 'withdrawal':
          if (transaction.status === 'completed') {
            stats.totalWithdrawals += transaction.amount;
          }
          break;
        case 'spin':
          stats.totalSpinWins += transaction.amount;
          break;
        case 'faucet':
          stats.totalFaucetClaims += transaction.amount;
          break;
        case 'mining':
          stats.totalMiningRewards += transaction.amount;
          break;
        case 'exchange':
          stats.totalExchanges += transaction.amount;
          break;
      }
    });

    return stats;
  }, [transactions]);

  // Filtrer les transactions par type
  const filterTransactions = useCallback((type?: Transaction['type'], status?: Transaction['status']) => {
    return transactions.filter(transaction => {
      if (type && transaction.type !== type) return false;
      if (status && transaction.status !== status) return false;
      return true;
    });
  }, [transactions]);

  // Charger les données au démarrage
  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  return {
    transactions,
    isLoading,
    loadTransactions,
    getTransactionStats,
    filterTransactions,
  };
};