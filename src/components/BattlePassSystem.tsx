import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Gift, Lock, Star, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface BattlePass {
  id: string;
  season_name: string;
  tier: string;
  level: number;
  experience_points: number;
  is_premium: boolean;
  rewards_claimed: any[];
}

const SEASON_DATA = {
  name: "Saison Alpha",
  maxLevel: 50,
  xpPerLevel: 1000,
  price: 25 // Prix en USD
};

const REWARDS = {
  1: { free: "100 DeadSpot", premium: "200 DeadSpot + Skin Rare" },
  5: { free: "Loot Box Commun", premium: "Loot Box Rare" },
  10: { free: "500 DeadSpot", premium: "1000 DeadSpot + Boost Mining" },
  15: { free: "Power-up", premium: "Power-up Premium" },
  20: { free: "Loot Box Rare", premium: "Loot Box Épique" },
  25: { free: "1000 DeadSpot", premium: "2000 DeadSpot + Skin Épique" },
  30: { free: "Power-up", premium: "Multiplicateur Permanent +5%" },
  35: { free: "Loot Box Épique", premium: "Loot Box Légendaire" },
  40: { free: "2000 DeadSpot", premium: "5000 DeadSpot + NFT Exclusif" },
  50: { free: "Skin Rare", premium: "Skin Légendaire + Titre Exclusif" }
};

const BattlePassSystem = () => {
  const { user } = useAuth();
  const [battlePass, setBattlePass] = useState<BattlePass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBattlePass();
    }
  }, [user]);

  const fetchBattlePass = async () => {
    try {
      const { data, error } = await supabase
        .from("battle_passes")
        .select("*")
        .eq("user_id", user?.id)
        .eq("season_name", SEASON_DATA.name)
        .single();

      if (error && error.code === "PGRST116") {
        // Créer un nouveau battle pass
        await createBattlePass();
      } else if (error) {
        throw error;
      } else {
        setBattlePass({
          ...data,
          rewards_claimed: Array.isArray(data.rewards_claimed) ? data.rewards_claimed : []
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement du Battle Pass:", error);
    } finally {
      setLoading(false);
    }
  };

  const createBattlePass = async () => {
    try {
      const { data, error } = await supabase
        .from("battle_passes")
        .insert({
          user_id: user?.id,
          season_name: SEASON_DATA.name,
          tier: "free",
          level: 1,
          experience_points: 0,
          is_premium: false,
          expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 jours
        })
        .select()
        .single();

      if (error) throw error;
      setBattlePass({
        ...data,
        rewards_claimed: Array.isArray(data.rewards_claimed) ? data.rewards_claimed : []
      });
    } catch (error) {
      console.error("Erreur création Battle Pass:", error);
      toast.error("Erreur lors de la création du Battle Pass");
    }
  };

  const purchasePremiumBattlePass = () => {
    const orderId = `BATTLEPASS_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Créer le formulaire Payeer
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payeer.com/merchant/';
    form.target = '_blank';

    const fields = {
      'm_shop': 'P1112145219',
      'm_orderid': orderId,
      'm_amount': SEASON_DATA.price.toFixed(2),
      'm_curr': 'USD',
      'm_desc': btoa(`Battle Pass Premium - ${SEASON_DATA.name}`),
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

    toast.success("Redirection vers Payeer pour le paiement...");
  };

  const upgradeToPremium = async () => {
    try {
      const { error } = await supabase
        .from("battle_passes")
        .update({ 
          is_premium: true,
          tier: "premium",
          premium_purchased_at: new Date().toISOString()
        })
        .eq("id", battlePass?.id);

      if (error) throw error;

      toast.success("Battle Pass Premium activé !");
      fetchBattlePass();
    } catch (error) {
      console.error("Erreur upgrade premium:", error);
      toast.error("Erreur lors de l'upgrade");
    }
  };

  const claimReward = async (level: number, type: 'free' | 'premium') => {
    if (!battlePass) return;

    const rewardKey = `${level}_${type}`;
    if (battlePass.rewards_claimed.includes(rewardKey)) {
      toast.error("Récompense déjà réclamée");
      return;
    }

    if (battlePass.level < level) {
      toast.error("Niveau requis non atteint");
      return;
    }

    if (type === 'premium' && !battlePass.is_premium) {
      toast.error("Battle Pass Premium requis");
      return;
    }

    try {
      const updatedRewards = [...battlePass.rewards_claimed, rewardKey];
      
      const { error } = await supabase
        .from("battle_passes")
        .update({ rewards_claimed: updatedRewards })
        .eq("id", battlePass.id);

      if (error) throw error;

      // Ajouter la récompense au profil utilisateur
      const reward = REWARDS[level as keyof typeof REWARDS]?.[type];
      if (reward?.includes("DeadSpot")) {
        const amount = parseInt(reward.match(/\d+/)?.[0] || "0");
        
        // Récupérer le montant actuel
        const { data: profile } = await supabase
          .from("profiles")
          .select("deadspot_tokens")
          .eq("user_id", user?.id)
          .single();
        
        if (profile) {
          await supabase
            .from("profiles")
            .update({ 
              deadspot_tokens: (profile.deadspot_tokens || 0) + amount
            })
            .eq("user_id", user?.id);
        }
      }

      toast.success(`Récompense réclamée: ${reward}`);
      fetchBattlePass();
    } catch (error) {
      console.error("Erreur réclamation récompense:", error);
      toast.error("Erreur lors de la réclamation");
    }
  };

  const getCurrentProgress = () => {
    if (!battlePass) return { current: 0, needed: SEASON_DATA.xpPerLevel, percent: 0 };
    
    const currentLevelXP = (battlePass.level - 1) * SEASON_DATA.xpPerLevel;
    const currentXP = battlePass.experience_points - currentLevelXP;
    const percent = (currentXP / SEASON_DATA.xpPerLevel) * 100;
    
    return {
      current: currentXP,
      needed: SEASON_DATA.xpPerLevel,
      percent: Math.min(percent, 100)
    };
  };

  if (loading) return <div>Chargement...</div>;
  if (!battlePass) return null;

  const progress = getCurrentProgress();

  return (
    <div className="space-y-6">
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">{SEASON_DATA.name}</CardTitle>
                <CardDescription>
                  Battle Pass - Niveau {battlePass.level} / {SEASON_DATA.maxLevel}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={battlePass.is_premium ? "default" : "secondary"}>
                {battlePass.is_premium ? "Premium" : "Gratuit"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression XP</span>
                <span>{progress.current} / {progress.needed}</span>
              </div>
              <Progress value={progress.percent} className="h-2" />
            </div>

            {!battlePass.is_premium && (
              <div className="flex gap-2">
                <Button 
                  variant="crypto" 
                  onClick={purchasePremiumBattlePass}
                  className="flex-1"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Passer Premium - ${SEASON_DATA.price}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={upgradeToPremium}
                  size="sm"
                >
                  J'ai payé
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Récompenses */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Récompenses de la Saison</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="rewards" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rewards">Récompenses</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rewards" className="space-y-4">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {Object.entries(REWARDS).map(([level, rewards]) => {
                  const levelNum = parseInt(level);
                  const isUnlocked = battlePass.level >= levelNum;
                  const freeRewardClaimed = battlePass.rewards_claimed.includes(`${level}_free`);
                  const premiumRewardClaimed = battlePass.rewards_claimed.includes(`${level}_premium`);

                  return (
                    <div key={level} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={isUnlocked ? "default" : "secondary"}>
                          Niveau {level}
                        </Badge>
                        {!isUnlocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Récompense gratuite */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                          <div className="flex items-center gap-2">
                            <Gift className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{rewards.free}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={freeRewardClaimed ? "secondary" : "default"}
                            disabled={!isUnlocked || freeRewardClaimed}
                            onClick={() => claimReward(levelNum, 'free')}
                          >
                            {freeRewardClaimed ? "Réclamé" : "Réclamer"}
                          </Button>
                        </div>

                        {/* Récompense premium */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-primary" />
                            <span className="text-sm">{rewards.premium}</span>
                          </div>
                          <Button
                            size="sm"
                            variant={premiumRewardClaimed ? "secondary" : "crypto"}
                            disabled={!isUnlocked || premiumRewardClaimed || !battlePass.is_premium}
                            onClick={() => claimReward(levelNum, 'premium')}
                          >
                            {premiumRewardClaimed ? "Réclamé" : (!battlePass.is_premium ? "Premium" : "Réclamer")}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="text-6xl font-bold text-primary">
                  {battlePass.level}
                </div>
                <div className="text-lg text-muted-foreground">
                  Niveau Actuel
                </div>
                <div className="text-sm">
                  {battlePass.experience_points} XP Total
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-lg bg-success/10 text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-success" />
                    <div className="font-bold">
                      {battlePass.rewards_claimed.filter(r => r.includes('free')).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Récompenses Gratuites
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <Crown className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="font-bold">
                      {battlePass.rewards_claimed.filter(r => r.includes('premium')).length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Récompenses Premium
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BattlePassSystem;