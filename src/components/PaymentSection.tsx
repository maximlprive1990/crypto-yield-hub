import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const WithdrawalSection = () => {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();

  const currencyOptions = [
    // Devises Fiat
    { value: "USD", label: "USD - Dollar américain" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "RUB", label: "RUB - Rouble russe" },
    { value: "UAH", label: "UAH - Hryvnia ukrainienne" },
    { value: "KZT", label: "KZT - Tenge kazakhstanais" },
    { value: "GBP", label: "GBP - Livre sterling" },
    { value: "JPY", label: "JPY - Yen japonais" },
    { value: "CAD", label: "CAD - Dollar canadien" },
    { value: "AUD", label: "AUD - Dollar australien" },
    { value: "CHF", label: "CHF - Franc suisse" },
    { value: "CNY", label: "CNY - Yuan chinois" },
    { value: "TRY", label: "TRY - Livre turque" },
    
    // Cryptomonnaies principales
    { value: "BTC", label: "BTC - Bitcoin" },
    { value: "ETH", label: "ETH - Ethereum" },
    { value: "LTC", label: "LTC - Litecoin" },
    { value: "BCH", label: "BCH - Bitcoin Cash" },
    { value: "USDT", label: "USDT - Tether (ERC-20)" },
    { value: "USDC", label: "USDC - USD Coin" },
    { value: "BUSD", label: "BUSD - Binance USD" },
    { value: "DAI", label: "DAI - Dai Stablecoin" },
    
    // Altcoins populaires
    { value: "ADA", label: "ADA - Cardano" },
    { value: "DOT", label: "DOT - Polkadot" },
    { value: "LINK", label: "LINK - Chainlink" },
    { value: "XRP", label: "XRP - Ripple" },
    { value: "XLM", label: "XLM - Stellar" },
    { value: "MATIC", label: "MATIC - Polygon" },
    { value: "AVAX", label: "AVAX - Avalanche" },
    { value: "SOL", label: "SOL - Solana" },
    { value: "ALGO", label: "ALGO - Algorand" },
    { value: "ATOM", label: "ATOM - Cosmos" },
    { value: "FTM", label: "FTM - Fantom" },
    { value: "NEAR", label: "NEAR - Near Protocol" },
    
    // Réseaux Tron et Binance Smart Chain
    { value: "TRX", label: "TRX - Tron" },
    { value: "USDT_TRC20", label: "USDT - Tether (TRC-20)" },
    { value: "USDC_TRC20", label: "USDC - USD Coin (TRC-20)" },
    { value: "BNB", label: "BNB - Binance Coin" },
    { value: "USDT_BSC", label: "USDT - Tether (BSC)" },
    { value: "BUSD_BSC", label: "BUSD - Binance USD (BSC)" },
    
    // Autres cryptos
    { value: "TON", label: "TON - Toncoin" },
    { value: "DOGE", label: "DOGE - Dogecoin" },
    { value: "SHIB", label: "SHIB - Shiba Inu" },
    { value: "UNI", label: "UNI - Uniswap" },
    { value: "AAVE", label: "AAVE - Aave" },
    { value: "COMP", label: "COMP - Compound" },
    { value: "MKR", label: "MKR - Maker" },
    { value: "SNX", label: "SNX - Synthetix" },
    { value: "CRV", label: "CRV - Curve DAO" },
    { value: "YFI", label: "YFI - Yearn.finance" },
    { value: "SUSHI", label: "SUSHI - SushiSwap" },
    { value: "1INCH", label: "1INCH - 1inch" },
    
    // Cryptomonnaies de privacy
    { value: "XMR", label: "XMR - Monero" },
    { value: "ZEC", label: "ZEC - Zcash" },
    { value: "DASH", label: "DASH - Dash" },
    
    // Autres réseaux populaires
    { value: "APT", label: "APT - Aptos" },
    { value: "SUI", label: "SUI - Sui" },
    { value: "ARB", label: "ARB - Arbitrum" },
    { value: "OP", label: "OP - Optimism" },
    { value: "MATIC_POLYGON", label: "MATIC - Polygon Network" },
    { value: "ETH_POLYGON", label: "ETH - Ethereum (Polygon)" },
    { value: "USDT_POLYGON", label: "USDT - Tether (Polygon)" },
    { value: "USDC_POLYGON", label: "USDC - USD Coin (Polygon)" }
  ];

  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: {
          amount: parseFloat(amount),
          currency,
          description: description || `Retrait de ${amount} ${currency}`
        }
      });

      if (error) throw error;

      if (data?.success) {
        setShowConfirmDialog(true);
        setAmount("");
        setDescription("");
        toast({
          title: "Demande envoyée",
          description: "Votre demande de retrait a été transmise avec succès",
        });
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la demande de retrait",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="py-20 px-6 bg-gradient-to-br from-secondary/20 to-primary/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Demander un Retrait
            </h2>
            <p className="text-lg text-muted-foreground">
              Retirez vos fonds de manière sécurisée
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de retrait */}
            <Card className="gradient-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💸 Demande de Retrait
                </CardTitle>
                <CardDescription>
                  Remplissez les informations pour votre demande de retrait
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant à retirer</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise/Cryptomonnaie</Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2 rounded-md bg-secondary/50 border border-primary/20"
                  >
                    {currencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Informations supplémentaires"
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>

                <Button 
                  variant="crypto" 
                  size="lg" 
                  className="w-full"
                  onClick={handleWithdrawal}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                >
                  {isLoading ? "Traitement..." : "Demander le Retrait"}
                </Button>
              </CardContent>
            </Card>

            {/* Informations importantes */}
            <div className="space-y-6">
              <Card className="border-warning/20">
                <CardHeader>
                  <CardTitle className="text-warning flex items-center gap-2">
                    ⚠️ Important - Délais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertDescription>
                      <strong>Temps de traitement:</strong>
                      <br />
                      • Vérification: 2h à 24h
                      <br />
                      • Traitement manuel par l'équipe
                      <br />
                      • Notification par email une fois traité
                      <br /><br />
                      <strong>IMPORTANT:</strong> Votre demande sera envoyée à notre équipe pour vérification.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              <Card className="border-info/20">
                <CardHeader>
                  <CardTitle className="text-info flex items-center gap-2">
                    🏦 Méthodes de Retrait Supportées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span>💳</span>
                      <span>Virements bancaires</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>₿</span>
                      <span>Cryptomonnaies (BTC, ETH, MATIC, etc.)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>💰</span>
                      <span>Monnaies fiduciaires (USD, EUR)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📱</span>
                      <span>Portefeuilles électroniques</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardHeader>
                  <CardTitle className="text-success flex items-center gap-2">
                    ✅ Processus Sécurisé
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <ul className="space-y-1">
                    <li>• Vérification manuelle de chaque demande</li>
                    <li>• Protection contre la fraude</li>
                    <li>• Confirmation par email</li>
                    <li>• Traçabilité complète</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Dialog de confirmation */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              ✅ Demande Envoyée
            </DialogTitle>
            <DialogDescription>
              Votre demande de retrait a été transmise avec succès.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                <strong>Votre demande est en attente de vérification</strong>
                <br /><br />
                • Temps estimé: 2h à 24h
                <br />
                • Vous recevrez une confirmation par email
                <br />
                • Notre équipe traitera votre demande manuellement
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => setShowConfirmDialog(false)}
              className="w-full"
            >
              Compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WithdrawalSection;