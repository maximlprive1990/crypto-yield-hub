import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Share, Users, DollarSign, Gift, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalAuth as useAuth } from "@/hooks/useLocalAuth";
import { supabase } from "@/integrations/supabase/client";

interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  total_earnings: number;
  monthly_earnings: number;
  recent_referrals: Array<{
    id: string;
    referred_user: string;
    earnings: number;
    created_at: string;
  }>;
}

interface ReferralResponse {
  success: boolean;
  message: string;
  referrer_bonus?: number;
  referred_bonus?: number;
}

const ReferralSystem = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [applyingCode, setApplyingCode] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    }
  }, [user]);

  const fetchReferralStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_referral_stats', {
        p_user_id: user?.id
      });

      if (error) throw error;
      
      setReferralStats(data as unknown as ReferralStats);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques de parrainage",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyReferralCode = async () => {
    if (!referralCodeInput.trim()) {
      toast({
        title: "Code requis",
        description: "Veuillez entrer un code de parrainage",
        variant: "destructive"
      });
      return;
    }

    setApplyingCode(true);
    try {
      const { data, error } = await supabase.rpc('process_referral', {
        p_referrer_code: referralCodeInput.trim().toUpperCase(),
        p_referred_user_id: user?.id
      });

      if (error) throw error;

      const result = data as unknown as ReferralResponse;
      if (result.success) {
        toast({
          title: "Parrainage appliqué !",
          description: `${result.message}. Vous avez gagné ${result.referred_bonus} DeadSpot tokens !`,
        });
        setReferralCodeInput("");
        fetchReferralStats(); // Refresh stats
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Error applying referral code:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'appliquer le code de parrainage",
        variant: "destructive"
      });
    } finally {
      setApplyingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!referralStats) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Impossible de charger les données de parrainage</p>
      </div>
    );
  }

  const referralUrl = `${window.location.origin}?ref=${referralStats.referral_code}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: "Le lien de parrainage a été copié dans le presse-papiers.",
    });
  };

  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rejoins CryptoStake Pro',
        text: 'Rejoins-moi sur CryptoStake Pro et gagne des crypto-récompenses !',
        url: referralUrl
      });
    } else {
      copyToClipboard(referralUrl);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="share">Partager</TabsTrigger>
          <TabsTrigger value="apply">Appliquer un code</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="gradient-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Parrainages</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralStats.total_referrals}</div>
                <p className="text-xs text-muted-foreground">
                  Utilisateurs référés
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gains Totaux</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralStats.total_earnings}</div>
                <p className="text-xs text-muted-foreground">
                  Tokens DeadSpot gagnés
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gains du Mois</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{referralStats.monthly_earnings}</div>
                <p className="text-xs text-muted-foreground">
                  Ce mois-ci
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card border-primary/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mon Code</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{referralStats.referral_code}</div>
                <p className="text-xs text-muted-foreground">
                  Code de parrainage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Referrals */}
          <Card className="gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Parrainages Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {referralStats.recent_referrals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun parrainage encore</p>
                  <p className="text-sm">Partagez votre code pour commencer à gagner !</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referralStats.recent_referrals.map((referral) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{referral.referred_user || 'Utilisateur'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        +{referral.earnings} DeadSpot
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          {/* Referral Link Card */}
          <Card className="gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Partagez votre Code de Parrainage
              </CardTitle>
              <CardDescription>
                Invitez des amis et gagnez 10 DeadSpot tokens par parrainage réussi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Votre code de parrainage</Label>
                <div className="flex gap-2">
                  <Input 
                    value={referralStats.referral_code} 
                    readOnly 
                    className="font-mono text-center text-lg font-bold"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(referralStats.referral_code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Lien de parrainage complet</Label>
                <div className="flex gap-2">
                  <Input 
                    value={referralUrl} 
                    readOnly 
                    className="text-sm"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => copyToClipboard(referralUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="default"
                    onClick={shareReferral}
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">🎁 Récompenses de Parrainage :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Vous gagnez :</strong> 10 DeadSpot tokens par parrainage</li>
                  <li>• <strong>Votre ami gagne :</strong> 5 DeadSpot tokens à l'inscription</li>
                  <li>• <strong>Bonus :</strong> Récompenses supplémentaires selon votre niveau</li>
                  <li>• <strong>Pas de limite :</strong> Parrainez autant d'amis que vous voulez</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="apply" className="space-y-6">
          <Card className="gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Utiliser un Code de Parrainage
              </CardTitle>
              <CardDescription>
                Entrez le code d'un ami pour gagner des tokens de bienvenue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="referral-code">Code de parrainage</Label>
                <div className="flex gap-2">
                  <Input
                    id="referral-code"
                    placeholder="Entrez le code ici"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value.toUpperCase())}
                    className="font-mono text-center"
                    maxLength={8}
                  />
                  <Button 
                    onClick={applyReferralCode}
                    disabled={applyingCode || !referralCodeInput.trim()}
                  >
                    {applyingCode ? "Application..." : "Appliquer"}
                  </Button>
                </div>
              </div>
              
              <div className="bg-info/10 border border-info/20 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-info">ℹ️ Important :</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Vous ne pouvez utiliser qu'un seul code de parrainage</li>
                  <li>• Le code doit être appliqué lors de votre première utilisation</li>
                  <li>• Vous et votre ami recevrez des tokens instantanément</li>
                  <li>• Les codes de parrainage sont sensibles à la casse</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReferralSystem;