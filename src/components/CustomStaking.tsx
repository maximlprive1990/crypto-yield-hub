import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CustomStaking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stakingDays, setStakingDays] = useState([30]);
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [memo, setMemo] = useState("");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [isLoading, setIsLoading] = useState(false);

  const cryptoOptions = [
    { symbol: "BTC", name: "Bitcoin", icon: "₿", needsMemo: false },
    { symbol: "MATIC", name: "Polygon", icon: "🔷", needsMemo: false },
    { symbol: "TRX", name: "TRON", icon: "🔺", needsMemo: false },
    { symbol: "TON", name: "Toncoin", icon: "💎", needsMemo: true },
    { symbol: "SOL", name: "Solana", icon: "☀️", needsMemo: false },
    { symbol: "DOGE", name: "Dogecoin", icon: "🐕", needsMemo: false }
  ];

  // Calcul du taux basé sur les jours (7 jours = 1%, 90 jours = 7%)
  const calculateAPY = (days: number) => {
    const minDays = 7;
    const maxDays = 90;
    const minAPY = 1;
    const maxAPY = 7;
    
    const normalizedDays = Math.max(minDays, Math.min(maxDays, days));
    const apy = minAPY + ((normalizedDays - minDays) / (maxDays - minDays)) * (maxAPY - minAPY);
    return Math.round(apy * 100) / 100;
  };

  const currentAPY = calculateAPY(stakingDays[0]);
  const selectedCryptoData = cryptoOptions.find(crypto => crypto.symbol === selectedCrypto);
  const estimatedRewards = amount ? (parseFloat(amount) * currentAPY / 100 * stakingDays[0] / 365).toFixed(6) : "0";

  const handleStaking = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour effectuer un staking",
        variant: "destructive"
      });
      return;
    }

    if (!amount || !walletAddress) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (selectedCryptoData?.needsMemo && !memo) {
      toast({
        title: "Erreur",
        description: "Un mémo est requis pour cette cryptomonnaie",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + stakingDays[0]);

      const { error } = await supabase
        .from('staking_positions')
        .insert({
          user_id: user.id,
          crypto_type: selectedCrypto,
          amount_staked: parseFloat(amount),
          apy: currentAPY,
          duration_days: stakingDays[0],
          end_date: endDate.toISOString(),
          wallet_address: walletAddress,
          memo: memo || null
        });

      if (error) throw error;

      toast({
        title: "Staking créé avec succès! 🎉",
        description: `Vous stakez ${amount} ${selectedCrypto} pour ${stakingDays[0]} jours à ${currentAPY}% APY`
      });

      // Reset form
      setAmount("");
      setWalletAddress("");
      setMemo("");
      setStakingDays([30]);

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

  return (
    <section className="py-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Staking Personnalisé
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez votre durée de staking et gagnez jusqu'à 7% APY selon la période sélectionnée
          </p>
        </div>

        <Card className="border-primary/20 backdrop-blur-sm bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              Configuration du Staking
            </CardTitle>
            <CardDescription>
              Configurez votre position de staking selon vos préférences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Sélection de la cryptomonnaie */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Cryptomonnaie</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {cryptoOptions.map((crypto) => (
                  <Button
                    key={crypto.symbol}
                    variant={selectedCrypto === crypto.symbol ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCrypto(crypto.symbol)}
                    className="flex flex-col gap-1 h-auto py-2"
                  >
                    <span className="text-lg">{crypto.icon}</span>
                    <span className="text-xs">{crypto.symbol}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Durée de staking */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Durée de staking</Label>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {stakingDays[0]} jours - {currentAPY}% APY
                </Badge>
              </div>
              
              <div className="px-2">
                <Slider
                  value={stakingDays}
                  onValueChange={setStakingDays}
                  max={90}
                  min={7}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 jours (1% APY)</span>
                <span>90 jours (7% APY)</span>
              </div>
            </div>

            <Separator />

            {/* Montant */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-medium">
                Montant à staker
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder={`Montant en ${selectedCrypto}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.000001"
                min="0"
              />
              {amount && (
                <p className="text-xs text-muted-foreground">
                  Récompenses estimées: {estimatedRewards} {selectedCrypto}
                </p>
              )}
            </div>

            {/* Adresse wallet */}
            <div className="space-y-2">
              <Label htmlFor="wallet" className="text-sm font-medium">
                Adresse du wallet
              </Label>
              <Input
                id="wallet"
                placeholder={`Votre adresse ${selectedCrypto}`}
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            </div>

            {/* Mémo (si nécessaire) */}
            {selectedCryptoData?.needsMemo && (
              <div className="space-y-2">
                <Label htmlFor="memo" className="text-sm font-medium">
                  Mémo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="memo"
                  placeholder="Mémo requis pour cette crypto"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Le mémo est obligatoire pour {selectedCryptoData.name}
                </p>
              </div>
            )}

            <Separator />

            {/* Résumé */}
            <div className="bg-secondary/20 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Résumé de votre staking</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Crypto:</span>
                  <div className="font-medium">{selectedCrypto}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Durée:</span>
                  <div className="font-medium">{stakingDays[0]} jours</div>
                </div>
                <div>
                  <span className="text-muted-foreground">APY:</span>
                  <div className="font-medium text-success">{currentAPY}%</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimation:</span>
                  <div className="font-medium text-success">+{estimatedRewards} {selectedCrypto}</div>
                </div>
              </div>
            </div>

            {/* Bouton de staking */}
            <Button 
              onClick={handleStaking}
              disabled={isLoading || !amount || !walletAddress || (selectedCryptoData?.needsMemo && !memo)}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Création en cours..." : `Commencer le Staking de ${selectedCrypto}`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CustomStaking;