import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Copy, Users, Gift, Star, Crown, Diamond } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const ReferralSystem = () => {
  const { toast } = useToast();
  const [referralCode] = useState('CRYPTO2024X7');
  
  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 245.67,
    thisMonthEarnings: 89.34,
    nextTierProgress: 67
  };

  const referralTiers = [
    { name: "Bronze", icon: Star, referrals: 5, bonus: "10%", color: "text-orange-600" },
    { name: "Silver", icon: Users, referrals: 15, bonus: "15%", color: "text-gray-500" },
    { name: "Gold", icon: Crown, referrals: 30, bonus: "20%", color: "text-yellow-500" },
    { name: "Diamond", icon: Diamond, referrals: 50, bonus: "25%", color: "text-blue-500" }
  ];

  const currentTier = referralTiers.find(tier => referralStats.totalReferrals >= tier.referrals) || referralTiers[0];
  const nextTier = referralTiers.find(tier => referralStats.totalReferrals < tier.referrals);

  const recentReferrals = [
    { name: "User****123", joinDate: "2024-01-15", status: "Active", earnings: 25.50 },
    { name: "Crypto****567", joinDate: "2024-01-12", status: "Active", earnings: 18.75 },
    { name: "Stake****890", joinDate: "2024-01-10", status: "Inactive", earnings: 12.30 },
    { name: "Moon****456", joinDate: "2024-01-08", status: "Active", earnings: 31.20 },
  ];

  const copyReferralCode = () => {
    navigator.clipboard.writeText(`https://cryptostake.pro/ref/${referralCode}`);
    toast({
      title: "Lien copié!",
      description: "Votre lien de parrainage a été copié dans le presse-papiers.",
    });
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Programme de Parrainage
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gagnez jusqu'à 25% des revenus de vos filleuls à vie! Plus vous parrainez, plus vos récompenses augmentent.
          </p>
        </div>

        {/* Referral Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Parrainés</p>
                  <p className="text-2xl font-bold">{referralStats.totalReferrals}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actifs</p>
                  <p className="text-2xl font-bold text-green-500">{referralStats.activeReferrals}</p>
                </div>
                <Star className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gains Totaux</p>
                  <p className="text-2xl font-bold">${referralStats.totalEarnings}</p>
                </div>
                <Gift className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ce Mois</p>
                  <p className="text-2xl font-bold text-blue-500">${referralStats.thisMonthEarnings}</p>
                </div>
                <currentTier.icon className={`h-8 w-8 ${currentTier.color}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Referral Link */}
          <Card>
            <CardHeader>
              <CardTitle>Votre Lien de Parrainage</CardTitle>
              <CardDescription>
                Partagez ce lien pour gagner des commissions sur tous les gains de vos filleuls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  value={`https://cryptostake.pro/ref/${referralCode}`}
                  readOnly
                  className="flex-1"
                />
                <Button onClick={copyReferralCode} size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Bonus de Parrainage Actuel</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vous gagnez <span className="text-primary font-semibold">{currentTier.bonus}</span> des revenus 
                  de vos filleuls grâce à votre statut <span className="font-semibold">{currentTier.name}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tier Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentTier.icon className={`h-5 w-5 ${currentTier.color}`} />
                Statut {currentTier.name}
              </CardTitle>
              <CardDescription>
                {nextTier ? `${nextTier.referrals - referralStats.totalReferrals} parrainages jusqu'au statut ${nextTier.name}` : 'Statut maximum atteint!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {nextTier && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progression vers {nextTier.name}</span>
                    <span>{referralStats.nextTierProgress}%</span>
                  </div>
                  <Progress value={referralStats.nextTierProgress} className="h-3" />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                {referralTiers.map((tier) => (
                  <div 
                    key={tier.name}
                    className={`p-3 rounded-lg border ${
                      tier.name === currentTier.name 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <tier.icon className={`h-4 w-4 ${tier.color}`} />
                      <span className="text-sm font-semibold">{tier.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tier.referrals}+ parrainés
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {tier.bonus}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle>Parrainages Récents</CardTitle>
            <CardDescription>Vos derniers filleuls et leurs performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReferrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{referral.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Inscrit le {new Date(referral.joinDate).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Badge variant={referral.status === 'Active' ? 'default' : 'secondary'}>
                      {referral.status === 'Active' ? 'Actif' : 'Inactif'}
                    </Badge>
                    <div className="text-right">
                      <div className="font-semibold text-green-500">
                        +${referral.earnings}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Gains générés
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ReferralSystem;