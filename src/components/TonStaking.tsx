
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth as useAuth } from "@/hooks/useLocalAuth";
import { useToast } from "@/hooks/use-toast";

interface StakingPosition {
  id: string;
  crypto_type: string;
  amount_staked: number;
  apy: number;
  total_rewards: number;
  status: string;
  created_at: string;
}

interface VerifyDepositResponse {
  success: boolean;
  message: string;
  amount?: number;
  crypto_type?: string;
}

const TonStaking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [positions, setPositions] = useState<StakingPosition[]>([]);

  const TON_WALLET = "EQD14kgmngE0fNYVs7_9dw78V3rPhNt7_Ee-7X3ykDORQvMp";
  const MEMO = "492929";
  const APY = 8.5; // 8.5% APY pour TON

  useEffect(() => {
    if (user) {
      loadStakingPositions();
    }
  }, [user]);

  const loadStakingPositions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('staking_positions')
      .select('*')
      .eq('user_id', user.id)
      .eq('crypto_type', 'TON')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Mapper explicitement vers notre interface avec fallbacks
      const formatted: StakingPosition[] = (data as any[]).map((row) => ({
        id: row.id,
        crypto_type: row.crypto_type ?? 'TON',
        amount_staked: Number(row.amount_staked) ?? 0,
        apy: Number(row.apy) ?? APY,
        total_rewards: Number(row.total_rewards) ?? 0,
        status: row.status ?? 'active',
        created_at: row.created_at,
      }));
      setPositions(formatted);
    }
  };

  const handleStakeStart = async () => {
    if (!user || !amount) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    const stakeAmount = parseFloat(amount);
    if (stakeAmount < 1) {
      toast({
        title: "Erreur",
        description: "Le montant minimum de staking est de 1 TON",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Créer un dépôt en attente
      const { error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          crypto_type: 'TON',
          amount: stakeAmount,
          wallet_address: TON_WALLET,
          memo: MEMO,
          status: 'pending'
        });

      if (depositError) throw depositError;

      // Créer une position de staking en attente
      const { error: stakingError } = await supabase
        .from('staking_positions')
        .insert({
          user_id: user.id,
          crypto_type: 'TON',
          amount_staked: stakeAmount,
          apy: APY,
          wallet_address: TON_WALLET,
          memo: MEMO,
          status: 'pending'
        });

      if (stakingError) throw stakingError;

      toast({
        title: "Position de staking créée! 🎉",
        description: `Envoyez ${stakeAmount} TON à l'adresse fournie avec le mémo pour activer votre staking.`
      });

      setAmount("");
      loadStakingPositions();

    } catch (error) {
      console.error('Erreur lors de la création du staking:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la position de staking",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTransaction = async () => {
    if (!txId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID de transaction",
        variant: "destructive"
      });
      return;
    }

    setIsVerifying(true);

    try {
      // Appel direct à la fonction RPC en contournant le typage strict
      const { data, error } = await (supabase as any).rpc('verify_deposit_by_txid', {
        p_user_id: user?.id,
        p_transaction_id: txId.trim()
      });

      if (error) throw error;

      const result = data as VerifyDepositResponse;
      
      if (result && result.success) {
        toast({
          title: "Transaction vérifiée! ✅",
          description: `Votre dépôt de ${result.amount} ${result.crypto_type} a été confirmé et votre staking est maintenant actif.`
        });
        setTxId("");
        loadStakingPositions();
      } else {
        toast({
          title: "Vérification échouée",
          description: result?.message || "Erreur lors de la vérification",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la vérification de la transaction",
        variant: "destructive"
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getTotalStaked = () => {
    return positions.filter(p => p.status === 'active').reduce((sum, p) => sum + p.amount_staked, 0);
  };

  const getTotalRewards = () => {
    return positions.reduce((sum, p) => sum + p.total_rewards, 0);
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Staking TON 💎
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stakez vos TON et gagnez {APY}% APY avec des récompenses quotidiennes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Nouveau Staking */}
          <Card className="border-primary/20 backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                Nouveau Staking TON
              </CardTitle>
              <CardDescription>
                Commencez à staker vos TON pour gagner des récompenses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Informations sur l'APY */}
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Taux de rendement annuel</span>
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    {APY}% APY
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Récompenses calculées et distribuées quotidiennement
                </div>
              </div>

              {/* Montant à staker */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Montant à staker (minimum 1 TON)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Exemple: 10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  step="0.1"
                  min="1"
                />
                {amount && (
                  <p className="text-xs text-muted-foreground">
                    Récompenses annuelles estimées: {(parseFloat(amount) * APY / 100).toFixed(2)} TON
                  </p>
                )}
              </div>

              <Separator />

              {/* Informations de dépôt */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Adresse de dépôt TON</h4>
                
                <div className="p-3 bg-secondary/30 rounded-lg border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-2">Adresse du wallet:</p>
                  <p className="text-sm font-mono break-all text-primary mb-3">{TON_WALLET}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-warning">Mémo obligatoire:</span>
                    <Badge variant="outline" className="font-mono">{MEMO}</Badge>
                  </div>
                  
                  <p className="text-xs text-destructive">
                    ⚠️ Le mémo est obligatoire pour identifier votre dépôt
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleStakeStart}
                disabled={isLoading || !amount || parseFloat(amount) < 1}
                className="w-full"
                size="lg"
              >
                {isLoading ? "Création en cours..." : "Créer la position de staking"}
              </Button>
            </CardContent>
          </Card>

          {/* Vérification de transaction */}
          <Card className="border-primary/20 backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Vérification de dépôt
              </CardTitle>
              <CardDescription>
                Vérifiez votre transaction pour activer le staking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <div className="text-lg font-bold text-primary">
                    {getTotalStaked().toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">TON Stakés</div>
                </div>
                <div className="text-center p-3 bg-secondary/20 rounded-lg">
                  <div className="text-lg font-bold text-success">
                    {getTotalRewards().toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">Récompenses</div>
                </div>
              </div>

              <Separator />

              {/* Vérification d'ID de transaction */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="txid" className="text-sm font-medium">
                    ID de transaction
                  </Label>
                  <Input
                    id="txid"
                    placeholder="Entrez l'ID de votre transaction TON"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Copiez l'ID de transaction depuis votre wallet TON
                  </p>
                </div>

                <Button 
                  onClick={handleVerifyTransaction}
                  disabled={isVerifying || !txId.trim()}
                  className="w-full"
                  variant="secondary"
                >
                  {isVerifying ? "Vérification..." : "Vérifier la transaction"}
                </Button>
              </div>

              {/* Instructions */}
              <div className="bg-info/10 rounded-lg p-4">
                <h5 className="text-sm font-medium mb-2">📋 Instructions:</h5>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Créez une position de staking</li>
                  <li>Envoyez vos TON à l'adresse fournie</li>
                  <li>N'oubliez pas le mémo: {MEMO}</li>
                  <li>Copiez l'ID de transaction</li>
                  <li>Vérifiez ici pour activer le staking</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Positions de staking */}
        {positions.length > 0 && (
          <Card className="mt-8 border-primary/20 backdrop-blur-sm bg-card/50">
            <CardHeader>
              <CardTitle>Mes positions de staking TON</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {positions.map(position => (
                  <div key={position.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{position.amount_staked} TON</span>
                        <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                          {position.status === 'active' ? 'Actif' : 'En attente'}
                        </Badge>
                        <Badge variant="outline">{position.apy}% APY</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Créé le {new Date(position.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-success">
                        +{position.total_rewards.toFixed(4)} TON
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Récompenses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default TonStaking;
