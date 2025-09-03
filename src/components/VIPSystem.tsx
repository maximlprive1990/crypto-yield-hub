
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Star, TrendingUp, Zap, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth as useAuth } from "@/hooks/useLocalAuth";
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

const CRYPTO_WALLETS = {
  BTC: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  ETH: "0x742d35cc6131b4c4e4c4d7b6c4f8c4d8c4d8c4d8",
  USDT: "TQn9Y2khEsLJW1ChVWFMSMeRDow5oNDMtb",
  DOGE: "DGZfwCxLFMEXiCqj62Q3XpYvPLJ4VcYCPG",
  LTC: "ltc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
};

const VIPSystem = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [vipAccount, setVipAccount] = useState<VIPAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState("bronze");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [transactionId, setTransactionId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

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

  const createPendingVIPAccount = async (tier: string) => {
    try {
      const tierData = VIP_TIERS[tier as keyof typeof VIP_TIERS];
      
      const { error } = await supabase
        .from("vip_accounts")
        .upsert({
          user_id: user?.id,
          tier,
          deposit_amount: tierData.price,
          transaction_id: null,
          status: 'pending',
          bonus_mining_rate: tierData.bonuses.mining,
          bonus_staking_apy: tierData.bonuses.staking,
          bonus_click_multiplier: tierData.bonuses.click,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast.success(`Commande VIP ${tierData.name} créée ! Effectuez le paiement et soumettez l'ID de transaction.`);
      setSelectedTier(tier);
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

    setIsVerifying(true);

    try {
      const { error } = await supabase
        .from("vip_accounts")
        .update({ 
          status: 'active',
          transaction_id: transactionId.trim()
        })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast.success("Transaction vérifiée ! Compte VIP activé.");
      setTransactionId("");
      fetchVIPAccount();
    } catch (error) {
      console.error("Erreur vérification:", error);
      toast.error("Erreur lors de la vérification");
    } finally {
      setIsVerifying(false);
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
                      
                      {vipAccount?.status === 'pending' && vipAccount.tier === tier ? (
                        <Badge variant="secondary" className="w-full justify-center">
                          En attente de paiement
                        </Badge>
                      ) : (
                        <Button 
                          variant="crypto" 
                          size="sm" 
                          className="w-full"
                          onClick={() => createPendingVIPAccount(tier)}
                          disabled={vipAccount?.status === 'pending'}
                        >
                          Commander VIP
                        </Button>
                      )}
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
                      Effectuez le paiement sur l'une de nos adresses crypto et entrez l'ID de transaction
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Adresses de paiement */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">Adresses de Paiement</Label>
                      <div className="space-y-3">
                        {Object.entries(CRYPTO_WALLETS).map(([crypto, address]) => (
                          <div key={crypto} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-primary/10">
                            <div className="flex items-center gap-3">
                              <div className="font-bold text-primary">{crypto}</div>
                              <div className="font-mono text-sm text-muted-foreground">{address}</div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(address);
                                toast.success(`Adresse ${crypto} copiée !`);
                              }}
                            >
                              Copier
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sélection crypto */}
                    <div className="space-y-2">
                      <Label htmlFor="cryptoSelect">Crypto utilisée pour le paiement</Label>
                      <select
                        id="cryptoSelect"
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                        className="w-full p-2 rounded-md bg-secondary/50 border border-primary/20"
                      >
                        {Object.keys(CRYPTO_WALLETS).map((crypto) => (
                          <option key={crypto} value={crypto}>{crypto}</option>
                        ))}
                      </select>
                    </div>

                    {/* ID de transaction */}
                    <div className="space-y-2">
                      <Label htmlFor="transactionId">ID de Transaction</Label>
                      <Input
                        id="transactionId"
                        placeholder="Entrez l'ID de votre transaction de paiement"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="bg-secondary/50 border-primary/20"
                      />
                    </div>

                    {/* Montant à payer */}
                    <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          Montant à payer: ${VIP_TIERS[vipAccount.tier as keyof typeof VIP_TIERS]?.price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tier: {VIP_TIERS[vipAccount.tier as keyof typeof VIP_TIERS]?.name}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="crypto" 
                      onClick={verifyTransaction}
                      disabled={!transactionId.trim() || isVerifying}
                      className="w-full"
                    >
                      {isVerifying ? "Vérification en cours..." : "Vérifier et Activer VIP"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Informations de Paiement */}
          <Card className="gradient-card border-info/20">
            <CardHeader>
              <CardTitle className="text-info">Informations de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold">Cryptos acceptées:</div>
                    <div className="text-muted-foreground">BTC, ETH, USDT, DOGE, LTC</div>
                  </div>
                  <div>
                    <div className="font-semibold">Confirmation:</div>
                    <div className="text-muted-foreground">Automatique après vérification</div>
                  </div>
                </div>
                <div className="text-muted-foreground text-xs mt-4 p-3 bg-warning/10 rounded-md">
                  ⚠️ Conservez précieusement votre ID de transaction pour la vérification. Les paiements sont vérifiés manuellement dans les 24h.
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
