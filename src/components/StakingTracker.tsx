import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface StakingPosition {
  id: string;
  crypto_type: string;
  amount_staked: number;
  total_rewards: number;
  apy: number;
  started_at: string;
}

const StakingTracker = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<StakingPosition[]>([]);

  useEffect(() => {
    if (user) {
      fetchStakingPositions();
    }
  }, [user]);

  const fetchStakingPositions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('staking_positions')
      .select('*')
      .eq('user_id', user.id)
      .order('started_at', { ascending: false });

    if (!error && data) {
      setPositions(data);
    }
  };

  const getTotalStaked = () => {
    return positions.reduce((sum, pos) => sum + Number(pos.amount_staked), 0);
  };

  const getTotalRewards = () => {
    return positions.reduce((sum, pos) => sum + Number(pos.total_rewards), 0);
  };

  const getStakedByType = (cryptoType: string) => {
    return positions
      .filter(p => p.crypto_type === cryptoType)
      .reduce((sum, p) => sum + Number(p.amount_staked), 0);
  };

  const getRewardsByType = (cryptoType: string) => {
    return positions
      .filter(p => p.crypto_type === cryptoType)
      .reduce((sum, p) => sum + Number(p.total_rewards), 0);
  };

  return (
    <div className="space-y-6">
      {/* Résumé total */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">
              {getTotalStaked().toFixed(8)}
            </div>
            <div className="text-sm text-muted-foreground">Total Staké</div>
          </CardContent>
        </Card>
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-6 text-center">
            <div className="text-2xl font-bold text-success mb-2">
              {getTotalRewards().toFixed(8)}
            </div>
            <div className="text-sm text-muted-foreground">Récompenses Totales</div>
          </CardContent>
        </Card>
      </div>

      {/* Positions par crypto */}
      {positions.length > 0 && (
        <Card className="gradient-card border-primary/20">
          <CardHeader>
            <CardTitle>Positions de Staking par Crypto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(new Set(positions.map(p => p.crypto_type))).map(cryptoType => (
                <div key={cryptoType} className="p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{cryptoType}</h3>
                    <Badge variant="secondary">
                      {positions.find(p => p.crypto_type === cryptoType)?.apy}% APY
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Staké:</span>
                      <span className="font-medium">{getStakedByType(cryptoType).toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Récompenses:</span>
                      <span className="font-medium text-success">+{getRewardsByType(cryptoType).toFixed(8)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historique des positions */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Historique des Positions</CardTitle>
        </CardHeader>
        <CardContent>
          {positions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucune position de staking trouvée
            </p>
          ) : (
            <div className="space-y-3">
              {positions.map(position => (
                <div key={position.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{position.amount_staked} {position.crypto_type}</span>
                      <Badge variant="default">{position.apy}% APY</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Commencé le {new Date(position.started_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-success">
                      +{position.total_rewards} {position.crypto_type}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Récompenses
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StakingTracker;