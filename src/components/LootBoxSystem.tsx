import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package, Gift, Star, Sparkles, Crown, Diamond } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LootBox {
  id: string;
  name: string;
  description: string;
  cost_deadspot: number;
  rarity: string;
  is_available: boolean;
}

interface LootBoxReward {
  id: string;
  reward_type: string;
  reward_name: string;
  reward_amount: number;
  drop_chance: number;
  rarity: string;
}

interface UserProfile {
  deadspot_tokens: number;
}

const LootBoxSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [openingBox, setOpeningBox] = useState<string | null>(null);
  const [revealedReward, setRevealedReward] = useState<LootBoxReward | null>(null);
  const [showRewardDialog, setShowRewardDialog] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch loot boxes
    const { data: lootBoxData, error: lootBoxError } = await supabase
      .from('loot_boxes')
      .select('*')
      .eq('is_available', true)
      .order('cost_deadspot', { ascending: true });

    if (!lootBoxError && lootBoxData) {
      setLootBoxes(lootBoxData);
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('deadspot_tokens')
      .eq('user_id', user.id)
      .single();

    if (!profileError && profileData) {
      setUserProfile(profileData);
    }

    setLoading(false);
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <Package className="h-6 w-6 text-gray-500" />;
      case 'rare': return <Star className="h-6 w-6 text-blue-500" />;
      case 'epic': return <Sparkles className="h-6 w-6 text-purple-500" />;
      case 'legendary': return <Crown className="h-6 w-6 text-yellow-500" />;
      default: return <Package className="h-6 w-6" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/50 bg-gray-500/10';
      case 'rare': return 'border-blue-500/50 bg-blue-500/10';
      case 'epic': return 'border-purple-500/50 bg-purple-500/10';
      case 'legendary': return 'border-yellow-500/50 bg-yellow-500/10';
      default: return 'border-border';
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-400 to-gray-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'legendary': return 'from-yellow-400 to-yellow-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const selectRandomReward = async (lootBoxId: string): Promise<LootBoxReward | null> => {
    const { data: rewards, error } = await supabase
      .from('loot_box_rewards')
      .select('*')
      .eq('loot_box_id', lootBoxId);

    if (error || !rewards || rewards.length === 0) return null;

    // Calculate weighted random selection based on drop chances
    const totalChance = rewards.reduce((sum, reward) => sum + reward.drop_chance, 0);
    const random = Math.random() * totalChance;
    
    let accumulator = 0;
    for (const reward of rewards) {
      accumulator += reward.drop_chance;
      if (random <= accumulator) {
        return reward;
      }
    }
    
    return rewards[0]; // Fallback
  };

  const openLootBox = async (lootBox: LootBox) => {
    if (!user || !userProfile || userProfile.deadspot_tokens < lootBox.cost_deadspot) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de DeadSpot coins pour ouvrir ce coffre.",
        variant: "destructive"
      });
      return;
    }

    setOpeningBox(lootBox.id);

    try {
      // Deduct cost from user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          deadspot_tokens: userProfile.deadspot_tokens - lootBox.cost_deadspot 
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Select random reward
      const reward = await selectRandomReward(lootBox.id);
      if (!reward) throw new Error('No reward found');

      // Record the opening
      const { error: openingError } = await supabase
        .from('user_loot_box_openings')
        .insert({
          user_id: user.id,
          loot_box_id: lootBox.id,
          reward_id: reward.id
        });

      if (openingError) throw openingError;

      // Apply reward to user profile
      if (reward.reward_type === 'deadspot') {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('deadspot_tokens')
          .eq('user_id', user.id)
          .single();
        
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              deadspot_tokens: currentProfile.deadspot_tokens + reward.reward_amount 
            })
            .eq('user_id', user.id);
        }
      } else if (reward.reward_type === 'experience') {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('experience_points')
          .eq('user_id', user.id)
          .single();
        
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              experience_points: (currentProfile.experience_points || 0) + reward.reward_amount 
            })
            .eq('user_id', user.id);
        }
      }

      // Show reward with animation delay
      setTimeout(() => {
        setRevealedReward(reward);
        setShowRewardDialog(true);
        setOpeningBox(null);
        fetchData(); // Refresh data
      }, 2000);

    } catch (error) {
      console.error('Error opening loot box:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ouverture du coffre.",
        variant: "destructive"
      });
      setOpeningBox(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Chargement des coffres...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            📦 Coffres Mystérieux
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ouvrez des coffres pour découvrir des récompenses aléatoires ! Plus le coffre est rare, meilleures sont les récompenses.
          </p>
          {userProfile && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                💰 {userProfile.deadspot_tokens.toLocaleString()} DeadSpot Coins
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lootBoxes.map((lootBox) => {
            const canAfford = userProfile && userProfile.deadspot_tokens >= lootBox.cost_deadspot;
            const isOpening = openingBox === lootBox.id;

            return (
              <Card 
                key={lootBox.id} 
                className={`gradient-card transition-all duration-300 hover-scale ${
                  getRarityColor(lootBox.rarity)
                } ${isOpening ? 'animate-pulse' : ''}`}
              >
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full bg-gradient-to-br ${getRarityGradient(lootBox.rarity)} animate-pulse`}>
                      {getRarityIcon(lootBox.rarity)}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{lootBox.name}</CardTitle>
                  <CardDescription>{lootBox.description}</CardDescription>
                  <Badge 
                    variant="outline" 
                    className={`mx-auto ${lootBox.rarity === 'legendary' ? 'border-yellow-500 text-yellow-500' : ''}`}
                  >
                    {lootBox.rarity.charAt(0).toUpperCase() + lootBox.rarity.slice(1)}
                  </Badge>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {lootBox.cost_deadspot.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">DeadSpot Coins</div>
                  </div>

                  <Button
                    onClick={() => openLootBox(lootBox)}
                    disabled={!canAfford || isOpening || !user}
                    className="w-full"
                    variant={canAfford ? "default" : "secondary"}
                  >
                    {isOpening ? (
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 animate-spin" />
                        Ouverture...
                      </div>
                    ) : canAfford ? (
                      <div className="flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Ouvrir
                      </div>
                    ) : (
                      "Solde insuffisant"
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Reward Reveal Dialog */}
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent className="text-center">
            <DialogHeader>
              <DialogTitle className="text-2xl mb-4">🎉 Félicitations !</DialogTitle>
              <DialogDescription>
                Vous avez obtenu une récompense !
              </DialogDescription>
            </DialogHeader>
            
            {revealedReward && (
              <div className="py-8">
                <div className={`mx-auto w-24 h-24 rounded-full bg-gradient-to-br ${
                  getRarityGradient(revealedReward.rarity)
                } flex items-center justify-center mb-4 animate-bounce`}>
                  <Gift className="h-12 w-12 text-white" />
                </div>
                
                <h3 className="text-xl font-bold mb-2">{revealedReward.reward_name}</h3>
                <div className="text-3xl font-bold text-primary mb-2">
                  {revealedReward.reward_amount}
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {revealedReward.rarity.charAt(0).toUpperCase() + revealedReward.rarity.slice(1)}
                </Badge>
              </div>
            )}

            <Button onClick={() => setShowRewardDialog(false)} className="w-full">
              Fantastique !
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default LootBoxSystem;