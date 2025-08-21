import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Star, TrendingUp, Zap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface VIPAccount {
  id: string;
  tier: string;
  deposit_amount: number;
  transaction_id: string | null;
  status: string;
  bonus_mining_rate: number;
  bonus_staking_apy: number;
  bonus_click_multiplier: number;
  expires_at: string | null;
}

const VIP_TIERS = {
  bronze: { name: "Bronze VIP", price: 50, color: "text-warning", bonuses: { mining: 10, staking: 5, click: 1.2 } },
  silver: { name: "Silver VIP", price: 150, color: "text-muted-foreground", bonuses: { mining: 20, staking: 10, click: 1.5 } },
  gold: { name: "Gold VIP", price: 300, color: "text-warning", bonuses: { mining: 35, staking: 20, click: 2.0 } },
  platinum: { name: "Platinum VIP", price: 500, color: "text-primary", bonuses: { mining: 50, staking: 35, click: 2.5 } }
};

const VIPSystem = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [vipAccount, setVipAccount] = useState<VIPAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactionId, setTransactionId] = useState("");
  const [selectedTier, setSelectedTier] = useState("bronze");

  useEffect(() => {
    if (user) {
      fetchVIPAccount();
    }
  }, [user]);

  const fetchVIPAccount = async () => {
    try {
      const { data, error } = await supabase
        .from("vip_accounts")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }
      
      setVipAccount(data);
    } catch (error) {
      console.error("Erreur lors du chargement du compte VIP:", error);
    } finally {
      setLoading(false);
    }
  };

  const generatePayeerPayment = (tier: string) => {
    const tierData = VIP_TIERS[tier as keyof typeof VIP_TIERS];
    const orderId = `VIP_${tier.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Créer le formulaire Payeer
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payeer.com/merchant/';
    form.target = '_blank';

    const fields = {
      'm_shop': 'P1112145219',
      'm_orderid': orderId,
      'm_amount': tierData.price.toFixed(2),
      'm_curr': 'USD',
      'm_desc': btoa(`VIP ${tier.toUpperCase()} Account - DeadSpot`),
      'm_sign': 'SIGNATURE_REQUIRED' // À remplacer par la vraie signature
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

    // Créer l'enregistrement en attente
    createPendingVIPAccount(orderId, tier, tierData.price);
  };

  const createPendingVIPAccount = async (orderId: string, tier: string, amount: number) => {
    try {
      const tierData = VIP_TIERS[tier as keyof typeof VIP_TIERS];
      
      const { error } = await supabase
        .from("vip_accounts")
        .upsert({
          user_id: user?.id,
          tier,
          deposit_amount: amount,
          transaction_id: orderId,
          status: 'pending',
          bonus_mining_rate: tierData.bonuses.mining,
          bonus_staking_apy: tierData.bonuses.staking,
          bonus_click_multiplier: tierData.bonuses.click,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 jours
        });

      if (error) throw error;

      toast.success("Commande VIP créée ! Complétez le paiement Payeer.");
      fetchVIPAccount();
    } catch (error) {
      console.error("Erreur création compte VIP:", error);
      toast.error("Erreur lors de la création du compte VIP");
    }
  };

  const verifyTransaction = async () => {
    if (!transactionId.trim()) {
      toast.error("Veuillez entrer un ID de transaction");
      return;
    }

    try {
      // Simulation de vérification - En réalité, vous voudriez vérifier avec l'API Payeer
      const { error } = await supabase
        .from("vip_accounts")
        .update({ 
          status: 'active',
          transaction_id: transactionId 
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Transaction vérifiée ! Compte VIP activé.");
      setTransactionId("");
      fetchVIPAccount();
    } catch (error) {
      console.error("Erreur vérification:", error);
      toast.error("Erreur lors de la vérification");
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-neon transition-smooth gradient-card border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Système VIP</CardTitle>
                    <CardDescription>
                      Débloquez des bonus exclusifs et des avantages premium
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {vipAccount?.status === 'active' && (
                    <Badge className="bg-success text-success-foreground">
                      {VIP_TIERS[vipAccount.tier as keyof typeof VIP_TIERS]?.name}
                    </Badge>
                  )}
                  {isOpen ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6">
          {/* Statut VIP actuel */}
          {vipAccount?.status === 'active' ? (
            <Card className="gradient-card border-success/20">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  Compte VIP Actif
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-primary/10">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-bold">+{vipAccount.bonus_mining_rate}%</div>
                    <div className="text-sm text-muted-foreground">Hash Rate</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-success/10">
                    <Star className="w-8 h-8 mx-auto mb-2 text-success" />
                    <div className="font-bold">+{vipAccount.bonus_staking_apy}%</div>
                    <div className="text-sm text-muted-foreground">APY Staking</div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-warning/10">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-warning" />
                    <div className="font-bold">{vipAccount.bonus_click_multiplier}x</div>
                    <div className="text-sm text-muted-foreground">Multiplicateur Click</div>
                  </div>
                </div>
                
                {vipAccount.expires_at && (
                  <div className="text-center text-sm text-muted-foreground">
                    Expire le: {new Date(vipAccount.expires_at).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Offres VIP */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(VIP_TIERS).map(([tier, data]) => (
                  <Card key={tier} className={`gradient-card border-primary/20 ${selectedTier === tier ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="text-center">
                      <CardTitle className={`text-lg ${data.color}`}>
                        {data.name}
                      </CardTitle>
                      <div className="text-3xl font-bold">${data.price}</div>
                      <CardDescription>30 jours d'avantages</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Mining Rate:</span>
                          <span className="text-success">+{data.bonuses.mining}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Staking APY:</span>
                          <span className="text-success">+{data.bonuses.staking}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Click Boost:</span>
                          <span className="text-success">{data.bonuses.click}x</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="crypto" 
                        size="sm" 
                        className="w-full"
                        onClick={() => generatePayeerPayment(tier)}
                      >
                        Payer avec Payeer
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Vérification de transaction */}
              {vipAccount?.status === 'pending' && (
                <Card className="gradient-card border-warning/20">
                  <CardHeader>
                    <CardTitle className="text-warning">Paiement en Attente</CardTitle>
                    <CardDescription>
                      Entrez votre ID de transaction Payeer pour activer votre compte VIP
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">ID de Transaction Payeer</Label>
                      <Input
                        id="transactionId"
                        placeholder="Entrez l'ID de votre transaction"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-secondary/50 border-primary/20"
                      />
                    </div>
                    <Button 
                      variant="crypto" 
                      onClick={verifyTransaction}
                      disabled={!transactionId.trim()}
                    >
                      Vérifier et Activer VIP
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Informations Payeer */}
          <Card className="gradient-card border-info/20">
            <CardHeader>
              <CardTitle className="text-info">Informations de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Compte Payeer:</span>
                  <span className="font-mono">P1112145219</span>
                </div>
                <div className="flex justify-between">
                  <span>Devises acceptées:</span>
                  <span>USD, EUR, BTC, USDT, ETH</span>
                </div>
                <div className="text-muted-foreground text-xs mt-4">
                  ⚠️ Conservez votre ID de transaction Payeer pour la vérification
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default VIPSystem;