import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, CreditCard, TrendingUp, Zap, ShoppingCart, Copy, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface CoinPurchase {
  id: string;
  amount_usd: number;
  amount_deadspot: number;
  currency: string;
  status: string;
  transaction_id: string | null;
  deposit_address?: string;
}

const EXCHANGE_RATE = 0.65; // 1 DeadSpot = 0.65 USD
const BTC_WALLET = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"; // Wallet Bitcoin de dépôt

const PRESET_AMOUNTS = [
  { usd: 10, deadspot: Math.floor(10 / EXCHANGE_RATE), btc: (10 / 45000).toFixed(8) },
  { usd: 25, deadspot: Math.floor(25 / EXCHANGE_RATE), btc: (25 / 45000).toFixed(8) },
  { usd: 50, deadspot: Math.floor(50 / EXCHANGE_RATE), btc: (50 / 45000).toFixed(8) },
  { usd: 100, deadspot: Math.floor(100 / EXCHANGE_RATE), btc: (100 / 45000).toFixed(8) },
  { usd: 250, deadspot: Math.floor(250 / EXCHANGE_RATE), btc: (250 / 45000).toFixed(8) },
  { usd: 500, deadspot: Math.floor(500 / EXCHANGE_RATE), btc: (500 / 45000).toFixed(8) }
];

const POWER_UPS = [
  {
    id: "double_mining",
    name: "Double Mining",
    description: "Double votre taux de mining pendant 1 heure",
    price: 50,
    icon: "⛏️",
    duration: "1 heure"
  },
  {
    id: "super_click",
    name: "Super Click",
    description: "Multiplicateur de click x5 pendant 30 minutes",
    price: 30,
    icon: "🖱️",
    duration: "30 minutes"
  },
  {
    id: "energy_boost",
    name: "Boost d'Énergie",
    description: "Énergie illimitée pendant 2 heures",
    price: 75,
    icon: "⚡",
    duration: "2 heures"
  },
  {
    id: "lucky_box",
    name: "Lucky Box",
    description: "Chance garantie de loot box rare",
    price: 100,
    icon: "🍀",
    duration: "Instantané"
  }
];

const DeadSpotShop = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<CoinPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  useEffect(() => {
    if (user) {
      fetchPurchases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from("coin_purchases")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des achats:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadSpot = (usdAmount: number) => {
    return Math.floor(usdAmount / EXCHANGE_RATE);
  };

  const purchaseCoins = async (usdAmount: number, btcAmount?: string) => {
    const deadspotAmount = calculateDeadSpot(usdAmount);
    const orderId = `DEADSPOT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Créer l'enregistrement de l'achat avec statut "waiting_deposit"
      const { error } = await supabase
        .from("coin_purchases")
        .insert({
          user_id: user?.id,
          amount_usd: usdAmount,
          amount_deadspot: deadspotAmount,
          exchange_rate: EXCHANGE_RATE,
          currency: 'BTC',
          transaction_id: orderId,
          status: 'waiting_deposit',
          deposit_address: BTC_WALLET
        });

      if (error) throw error;

      toast.success(`Commande créée ! Déposez ${btcAmount || (usdAmount / 45000).toFixed(8)} BTC au wallet pour recevoir ${deadspotAmount} DeadSpot coins.`);
      fetchPurchases();
    } catch (error) {
      console.error("Erreur création achat:", error);
      toast.error("Erreur lors de la création de l'achat");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Adresse copiée dans le presse-papiers !");
  };

  const purchaseCustomAmount = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount) || amount < 1) {
      toast.error("Montant invalide (minimum 1 USD)");
      return;
    }
    if (amount > 10000) {
      toast.error("Montant maximum: 10,000 USD");
      return;
    }
    
    const btcAmount = (amount / 45000).toFixed(8);
    purchaseCoins(amount, btcAmount);
    setCustomAmount("");
  };

  const purchasePowerUp = (powerUp: any) => {
    const orderId = `POWERUP_${powerUp.id}_${Date.now()}`;
    
    // Créer le formulaire Payeer
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payeer.com/merchant/';
    form.target = '_blank';

    const fields = {
      'm_shop': 'P1112145219',
      'm_orderid': orderId,
      'm_amount': powerUp.price.toFixed(2),
      'm_curr': 'USD',
      'm_desc': btoa(`Power-up: ${powerUp.name}`),
      'm_sign': 'SIGNATURE_REQUIRED'
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value.toString();
      form.appendChild(input);
    });

    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.name = 'm_process';
    submitBtn.value = 'send';
    form.appendChild(submitBtn);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    toast.success(`Power-up ${powerUp.name} commandé !`);
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <div>
              <CardTitle className="text-2xl">DeadSpot Shop</CardTitle>
              <CardDescription>
                Achetez des DeadSpot coins et des power-ups
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="coins" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="coins">💰 Acheter Coins</TabsTrigger>
          <TabsTrigger value="powerups">⚡ Power-ups</TabsTrigger>
          <TabsTrigger value="history">📋 Historique</TabsTrigger>
        </TabsList>

        <TabsContent value="coins" className="space-y-6">
          {/* Instructions de dépôt */}
          <Card className="gradient-card border-warning/20 bg-warning/5">
            <CardHeader>
              <CardTitle className="text-warning flex items-center gap-2">
                <Wallet className="w-6 h-6" />
                Comment acheter des DeadSpot Coins
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="mb-3">📋 <strong>Instructions:</strong></p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Choisissez le montant souhaité ci-dessous</li>
                  <li>Déposez le montant BTC équivalent à notre wallet</li>
                  <li>Envoyez-nous votre TXID de transaction</li>
                  <li>Recevez vos DeadSpot coins après confirmation (15min-4h)</li>
                </ol>
              </div>
              
              <div className="bg-card/50 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <Label className="font-semibold">Wallet Bitcoin de dépôt:</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => copyToClipboard(BTC_WALLET)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </div>
                <div className="font-mono text-sm bg-secondary/50 p-2 rounded border break-all">
                  {BTC_WALLET}
                </div>
              </div>

              <div className="text-center">
                <div className="text-xl font-bold">1 DeadSpot = $0.65</div>
                <div className="text-sm text-muted-foreground">BTC/USD ≈ $45,000 (prix estimé)</div>
              </div>
            </CardContent>
          </Card>

          {/* Montants prédéfinis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_AMOUNTS.map((preset, index) => (
              <Card key={index} className="gradient-card border-primary/20 hover:shadow-neon transition-smooth">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {preset.deadspot.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    DeadSpot Coins
                  </div>
                  <div className="text-lg font-semibold mb-1">
                    ${preset.usd}
                  </div>
                  <div className="text-sm text-warning font-mono mb-4">
                    ≈ {preset.btc} BTC
                  </div>
                  <Button 
                    variant="crypto" 
                    size="sm" 
                    className="w-full"
                    onClick={() => purchaseCoins(preset.usd, preset.btc)}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Créer Commande
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Montant personnalisé */}
          <Card className="gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Montant Personnalisé</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Montant (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Ex: 75"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="bg-secondary/50 border-primary/20"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>BTC à déposer</Label>
                  <div className="p-2 rounded-md bg-warning/10 border border-warning/20 text-center font-mono font-bold">
                    {customAmount ? ((parseFloat(customAmount) || 0) / 45000).toFixed(8) : "0.00000000"} BTC
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>DeadSpot Reçus</Label>
                  <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-center font-bold">
                    {customAmount ? calculateDeadSpot(parseFloat(customAmount) || 0).toLocaleString() : "0"} DSC
                  </div>
                </div>
              </div>
              
              <Button 
                variant="crypto" 
                size="lg" 
                className="w-full"
                onClick={purchaseCustomAmount}
                disabled={!customAmount || parseFloat(customAmount) < 1}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Créer Commande pour {customAmount ? calculateDeadSpot(parseFloat(customAmount) || 0).toLocaleString() : "0"} DeadSpot
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="powerups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {POWER_UPS.map((powerUp) => (
              <Card key={powerUp.id} className="gradient-card border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{powerUp.icon}</div>
                    <div>
                      <CardTitle className="text-lg">{powerUp.name}</CardTitle>
                      <CardDescription>{powerUp.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary">{powerUp.duration}</Badge>
                    <div className="text-xl font-bold">${powerUp.price}</div>
                  </div>
                  <Button 
                    variant="crypto" 
                    className="w-full"
                    onClick={() => purchasePowerUp(powerUp)}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Acheter Power-up
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="gradient-card border-primary/20">
            <CardHeader>
              <CardTitle>Historique des Achats</CardTitle>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Aucun achat effectué
                </div>
              ) : (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="p-4 rounded-lg border border-primary/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Coins className="w-6 h-6 text-primary" />
                          <div>
                            <div className="font-semibold">
                              {purchase.amount_deadspot.toLocaleString()} DeadSpot Coins
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${purchase.amount_usd} ≈ {(purchase.amount_usd / 45000).toFixed(8)} BTC
                            </div>
                          </div>
                        </div>
                        <Badge variant={
                          purchase.status === 'completed' ? 'default' : 
                          purchase.status === 'waiting_deposit' ? 'outline' : 'secondary'
                        }>
                          {purchase.status === 'completed' ? 'Complété' : 
                           purchase.status === 'waiting_deposit' ? 'En attente de dépôt' : 'En attente'}
                        </Badge>
                      </div>
                      
                      {purchase.status === 'waiting_deposit' && (
                        <div className="bg-warning/10 p-3 rounded border border-warning/20">
                          <div className="text-sm">
                            <strong>📋 Instructions:</strong>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              <li>Envoyez <strong>{(purchase.amount_usd / 45000).toFixed(8)} BTC</strong> à l'adresse:</li>
                              <li className="font-mono text-xs break-all">{purchase.deposit_address}</li>
                              <li>Contactez le support avec votre TXID</li>
                            </ol>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => copyToClipboard(purchase.deposit_address || BTC_WALLET)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copier adresse
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeadSpotShop;