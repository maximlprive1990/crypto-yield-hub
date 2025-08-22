import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAllDataPersistence } from '@/hooks/useAllDataPersistence';
import { toast } from 'sonner';

export const DataPersistenceDashboard = () => {
  const {
    miningData,
    gameData,
    transactions,
    isLoading,
    autoSync,
    emergencyBackup,
    exportUserData,
    getUserStats,
    transactionStats,
  } = useAllDataPersistence();
  
  const [userStats, setUserStats] = useState<any>(null);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  // Charger les statistiques utilisateur
  useEffect(() => {
    getUserStats().then(setUserStats);
  }, [getUserStats]);

  // Forcer la synchronisation
  const handleManualSync = async () => {
    toast.promise(autoSync(), {
      loading: 'Synchronisation en cours...',
      success: 'Données synchronisées avec succès!',
      error: 'Erreur lors de la synchronisation',
    });
    setLastSync(new Date());
  };

  // Exporter les données
  const handleExportData = async () => {
    toast.promise(
      exportUserData().then(data => {
        if (data) {
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `deadspot-data-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }),
      {
        loading: 'Exportation en cours...',
        success: 'Données exportées avec succès!',
        error: 'Erreur lors de l\'exportation',
      }
    );
  };

  // Sauvegarde manuelle
  const handleEmergencyBackup = async () => {
    toast.promise(emergencyBackup(), {
      loading: 'Sauvegarde en cours...',
      success: 'Sauvegarde réussie!',
      error: 'Erreur lors de la sauvegarde',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement des données...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📊 Tableau de Bord des Données</span>
            <div className="flex gap-2">
              <Button onClick={handleManualSync} variant="outline" size="sm">
                🔄 Synchroniser
              </Button>
              <Button onClick={handleEmergencyBackup} variant="outline" size="sm">
                💾 Sauvegarder
              </Button>
              <Button onClick={handleExportData} variant="outline" size="sm">
                📤 Exporter
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Dernière sync: {lastSync.toLocaleTimeString()}</span>
            <Badge variant="outline" className="text-green-600">
              ✅ Données protégées
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="mining">Mining</TabsTrigger>
          <TabsTrigger value="gaming">Gaming</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Deadspot Coins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {miningData.deadspot_coins.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">DSC disponibles</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Hashrate Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {miningData.total_hashrate_earned.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Hashrate miné</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Blocs Minés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {miningData.total_blocks_mined}
                </div>
                <p className="text-xs text-muted-foreground">Blocs découverts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diamants</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-500">
                  {gameData.diamonds}
                </div>
                <p className="text-xs text-muted-foreground">Diamants collectés</p>
              </CardContent>
            </Card>
          </div>

          {userStats && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques Globales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Âge du compte</p>
                    <p className="text-lg font-semibold">{userStats.account_age_days} jours</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total transactions</p>
                    <p className="text-lg font-semibold">{userStats.total_transactions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dernière activité</p>
                    <p className="text-lg font-semibold">
                      {userStats.last_activity ? new Date(userStats.last_activity).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Mining */}
        <TabsContent value="mining" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>État du Mining</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={miningData.is_currently_mining ? "default" : "secondary"}>
                    {miningData.is_currently_mining ? "🟢 Actif" : "🔴 Arrêté"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Throttle CPU:</span>
                  <span>{Math.round((1 - miningData.mining_throttle) * 100)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Hashrate accumulé:</span>
                  <span className="font-mono">{miningData.accumulated_hashrate.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques Mining</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Total hashrate miné:</span>
                  <span className="font-mono">{miningData.total_hashrate_earned.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Blocs découverts:</span>
                  <span className="font-mono">{miningData.total_blocks_mined}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Session démarrée:</span>
                  <span className="text-sm">
                    {miningData.current_mining_session_start 
                      ? new Date(miningData.current_mining_session_start).toLocaleString()
                      : 'N/A'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Gaming */}
        <TabsContent value="gaming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Clicker</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Niveau:</span>
                    <span className="font-bold">{gameData.clickerLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expérience:</span>
                    <span>{gameData.clickerExperience}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total clics:</span>
                    <span>{gameData.totalClicks.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
               <CardHeader>
                 <CardTitle>Activités</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Spins totaux:</span>
                    <span>{gameData.totalSpins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réclamations faucet:</span>
                    <span>{gameData.faucetClaims}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jours consécutifs:</span>
                    <span>{gameData.consecutiveDays}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions */}
        <TabsContent value="transactions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Dépôts Totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  ${transactionStats.totalDeposits.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Retraits Totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  ${transactionStats.totalWithdrawals.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gains Spin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {transactionStats.totalSpinWins.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">En Attente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">
                  {transactionStats.pendingTransactions}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historique Récent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {transactions.slice(0, 10).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{transaction.type}</Badge>
                      <span className="text-sm">{transaction.description}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">
                        {transaction.amount} {transaction.currency}
                      </span>
                      <Badge variant={
                        transaction.status === 'completed' ? 'default' :
                        transaction.status === 'pending' ? 'secondary' : 'destructive'
                      }>
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};