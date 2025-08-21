import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, CreditCard, TrendingUp, Zap, ShoppingCart } from "lucide-react";
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
}

const EXCHANGE_RATE = 0.65; // 1 DeadSpot = 0.65 USD
const PRESET_AMOUNTS = [
  { usd: 10, deadspot: Math.floor(10 / EXCHANGE_RATE) },
  { usd: 25, deadspot: Math.floor(25 / EXCHANGE_RATE) },
  { usd: 50, deadspot: Math.floor(50 / EXCHANGE_RATE) },
  { usd: 100, deadspot: Math.floor(100 / EXCHANGE_RATE) },
  { usd: 250, deadspot: Math.floor(250 / EXCHANGE_RATE) },
  { usd: 500, deadspot: Math.floor(500 / EXCHANGE_RATE) }
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

  const purchaseCoins = (usdAmount: number, currency: string = "USD") => {
    const deadspotAmount = calculateDeadSpot(usdAmount);
    const orderId = `DEADSPOT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Créer le formulaire Payeer
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payeer.com/merchant/';
    form.target = '_blank';

    const fields = {
      'm_shop': 'P1112145219',
      'm_orderid': orderId,
      'm_amount': usdAmount.toFixed(2),
      'm_curr': currency,
      'm_desc': btoa(`${deadspotAmount} DeadSpot Coins`),
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

    // Créer l'enregistrement de l'achat
    createPurchaseRecord(orderId, usdAmount, deadspotAmount, currency);
  };

  const createPurchaseRecord = async (orderId: string, usdAmount: number, deadspotAmount: number, currency: string) => {
    try {
      const { error } = await supabase
        .from("coin_purchases")
        .insert({
          user_id: user?.id,
          amount_usd: usdAmount,
          amount_deadspot: deadspotAmount,
          exchange_rate: EXCHANGE_RATE,
          currency,
          transaction_id: orderId,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Commande créée ! Complétez le paiement sur Payeer.");
      fetchPurchases();
    } catch (error) {
      console.error("Erreur création achat:", error);
      toast.error("Erreur lors de la création de l'achat");
    }
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
    
    purchaseCoins(amount, selectedCurrency);
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
          {/* Taux de change */}
          <Card className="gradient-card border-info/20">
            <CardHeader>
              <CardTitle className="text-info flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Taux de Change Actuel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold">1 DeadSpot = $0.65</div>
                <div className="text-sm text-muted-foreground">Taux fixe</div>
              </div>
            </CardContent>
          </Card>

          {/* Montants prédéfinis */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_AMOUNTS.map((preset, index) => (
              <Card key={index} className="gradient-card border-primary/20 hover:shadow-neon transition-smooth cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {preset.deadspot.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mb-4">
                    DeadSpot Coins
                  </div>
                  <div className="text-lg font-semibold mb-4">
                    ${preset.usd}
                  </div>
                  <Button 
                    variant="crypto" 
                    size="sm" 
                    className="w-full"
                    onClick={() => purchaseCoins(preset.usd)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Acheter
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
                  <Label htmlFor="currency">Devise</Label>
                  <select
                    id="currency"
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="w-full p-2 rounded-md bg-secondary/50 border border-primary/20"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                    <option value="ETH">ETH</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>DeadSpot Reçus</Label>
                  <div className="p-2 rounded-md bg-primary/10 border border-primary/20 text-center font-bold">
                    {customAmount ? calculateDeadSpot(parseFloat(customAmount) || 0).toLocaleString() : "0"}
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
                <Coins className="w-5 h-5 mr-2" />
                Acheter {customAmount ? calculateDeadSpot(parseFloat(customAmount) || 0).toLocaleString() : "0"} DeadSpot
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
                    <div key={purchase.id} className="flex items-center justify-between p-4 rounded-lg border border-primary/20">
                      <div className="flex items-center gap-4">
                        <Coins className="w-6 h-6 text-primary" />
                        <div>
                          <div className="font-semibold">
                            {purchase.amount_deadspot.toLocaleString()} DeadSpot
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${purchase.amount_usd} {purchase.currency}
                          </div>
                        </div>
                      </div>
                      <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                        {purchase.status === 'completed' ? 'Complété' : 'En attente'}
                      </Badge>
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