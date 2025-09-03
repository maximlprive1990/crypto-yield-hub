import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Home, Palette, Crown, Star, Package, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalAuth as useAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';

interface Skin {
  id: string;
  name: string;
  description: string;
  skin_type: string;
  rarity: string;
  cost_deadspot: number;
  is_premium: boolean;
  unlocked_by: string;
}

interface UserSkin {
  id: string;
  skin_id: string;
  is_equipped: boolean;
  skins: Skin;
}

interface UserProfile {
  deadspot_tokens: number;
}

const CustomizationSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skins, setSkins] = useState<Skin[]>([]);
  const [userSkins, setUserSkins] = useState<UserSkin[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('avatar');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    // Fetch all available skins
    const { data: skinsData, error: skinsError } = await supabase
      .from('skins')
      .select('*')
      .order('cost_deadspot', { ascending: true });

    if (!skinsError && skinsData) {
      setSkins(skinsData);
    }

    // Fetch user's owned skins
    const { data: userSkinsData, error: userSkinsError } = await supabase
      .from('user_skins')
      .select(`
        *,
        skins (*)
      `)
      .eq('user_id', user.id);

    if (!userSkinsError && userSkinsData) {
      setUserSkins(userSkinsData);
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

  const getSkinTypeIcon = (skinType: string) => {
    switch (skinType) {
      case 'avatar': return <User className="h-5 w-5" />;
      case 'mining_farm': return <Home className="h-5 w-5" />;
      case 'ui_theme': return <Palette className="h-5 w-5" />;
      default: return <Package className="h-5 w-5" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500/50 bg-gray-500/10 text-gray-700';
      case 'rare': return 'border-blue-500/50 bg-blue-500/10 text-blue-700';
      case 'epic': return 'border-purple-500/50 bg-purple-500/10 text-purple-700';
      case 'legendary': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-700';
      default: return 'border-border';
    }
  };

  const getSkinTypeLabel = (skinType: string) => {
    switch (skinType) {
      case 'avatar': return 'Avatar';
      case 'mining_farm': return 'Ferme Mining';
      case 'ui_theme': return 'Thème UI';
      default: return skinType;
    }
  };

  const isOwned = (skinId: string) => {
    return userSkins.some(us => us.skin_id === skinId);
  };

  const isEquipped = (skinId: string) => {
    return userSkins.some(us => us.skin_id === skinId && us.is_equipped);
  };

  const canPurchase = (skin: Skin) => {
    return userProfile && userProfile.deadspot_tokens >= skin.cost_deadspot && !isOwned(skin.id);
  };

  const purchaseSkin = async (skin: Skin) => {
    if (!user || !userProfile || !canPurchase(skin)) return;

    try {
      // Deduct cost from user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          deadspot_tokens: userProfile.deadspot_tokens - skin.cost_deadspot 
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Add skin to user's collection
      const { error: skinError } = await supabase
        .from('user_skins')
        .insert({
          user_id: user.id,
          skin_id: skin.id
        });

      if (skinError) throw skinError;

      toast({
        title: "Skin acheté !",
        description: `Vous avez acheté ${skin.name} pour ${skin.cost_deadspot} DeadSpot coins.`,
      });

      fetchData(); // Refresh data

    } catch (error) {
      console.error('Error purchasing skin:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'achat du skin.",
        variant: "destructive"
      });
    }
  };

  const equipSkin = async (skinId: string, skinType: string) => {
    if (!user) return;

    try {
      // Unequip all skins of the same type
      await supabase
        .from('user_skins')
        .update({ is_equipped: false })
        .eq('user_id', user.id)
        .in('skin_id', skins.filter(s => s.skin_type === skinType).map(s => s.id));

      // Equip the selected skin
      const { error } = await supabase
        .from('user_skins')
        .update({ is_equipped: true })
        .eq('user_id', user.id)
        .eq('skin_id', skinId);

      if (error) throw error;

      toast({
        title: "Skin équipé !",
        description: "Votre nouveau style a été appliqué.",
      });

      fetchData(); // Refresh data

    } catch (error) {
      console.error('Error equipping skin:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'équipement du skin.",
        variant: "destructive"
      });
    }
  };

  const skinsByType = skins.reduce((acc, skin) => {
    if (!acc[skin.skin_type]) acc[skin.skin_type] = [];
    acc[skin.skin_type].push(skin);
    return acc;
  }, {} as Record<string, Skin[]>);

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Chargement de la personnalisation...</div>
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
            🎨 Personnalisation
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Personnalisez votre expérience avec des skins exclusifs ! Débloquez de nouveaux avatars, thèmes et fermes de mining.
          </p>
          {userProfile && (
            <div className="mt-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                💰 {userProfile.deadspot_tokens.toLocaleString()} DeadSpot Coins
              </Badge>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="avatar" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Avatars
            </TabsTrigger>
            <TabsTrigger value="mining_farm" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Fermes
            </TabsTrigger>
            <TabsTrigger value="ui_theme" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Thèmes
            </TabsTrigger>
          </TabsList>

          {Object.entries(skinsByType).map(([skinType, typeSkinsArray]) => (
            <TabsContent key={skinType} value={skinType} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {typeSkinsArray.map((skin) => {
                  const owned = isOwned(skin.id);
                  const equipped = isEquipped(skin.id);
                  const affordable = canPurchase(skin);

                  return (
                    <Card 
                      key={skin.id} 
                      className={`gradient-card transition-all duration-300 hover-scale ${
                        getRarityColor(skin.rarity)
                      } ${equipped ? 'ring-2 ring-primary' : ''}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getSkinTypeIcon(skin.skin_type)}
                            <div>
                              <CardTitle className="text-lg">{skin.name}</CardTitle>
                              <CardDescription>{skin.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Badge variant="outline" className={getRarityColor(skin.rarity)}>
                              {skin.rarity.charAt(0).toUpperCase() + skin.rarity.slice(1)}
                            </Badge>
                            {equipped && (
                              <Badge variant="default" className="bg-green-500">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Équipé
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Débloqué par:</span>
                            <Badge variant="secondary" className="text-xs">
                              {skin.unlocked_by === 'purchase' ? 'Achat' : 
                               skin.unlocked_by === 'achievement' ? 'Succès' :
                               skin.unlocked_by === 'lootbox' ? 'Coffre' : 'Événement'}
                            </Badge>
                          </div>
                          
                          {skin.is_premium && (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>

                        {skin.cost_deadspot > 0 && (
                          <div className="text-center">
                            <div className="text-xl font-bold text-primary mb-1">
                              {skin.cost_deadspot.toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">DeadSpot Coins</div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {!owned ? (
                            <Button
                              onClick={() => purchaseSkin(skin)}
                              disabled={!affordable || skin.unlocked_by !== 'purchase'}
                              className="flex-1"
                              variant={affordable ? "default" : "secondary"}
                            >
                              {skin.unlocked_by !== 'purchase' ? (
                                'Non disponible'
                              ) : affordable ? (
                                'Acheter'
                              ) : (
                                'Solde insuffisant'
                              )}
                            </Button>
                          ) : equipped ? (
                            <Button disabled className="flex-1" variant="outline">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Équipé
                            </Button>
                          ) : (
                            <Button
                              onClick={() => equipSkin(skin.id, skin.skin_type)}
                              className="flex-1"
                            >
                              Équiper
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Owned Skins Summary */}
        <Card className="gradient-card border-primary/20 mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Ma Collection
            </CardTitle>
            <CardDescription>
              Résumé de vos skins possédés et équipés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(skinsByType).map(([skinType, typeSkinsArray]) => {
                const ownedCount = typeSkinsArray.filter(skin => isOwned(skin.id)).length;
                const equippedSkin = typeSkinsArray.find(skin => isEquipped(skin.id));

                return (
                  <div key={skinType} className="text-center p-4 bg-secondary/30 rounded-lg">
                    <div className="flex justify-center mb-2">
                      {getSkinTypeIcon(skinType)}
                    </div>
                    <div className="text-sm font-medium mb-1">
                      {getSkinTypeLabel(skinType)}
                    </div>
                    <div className="text-lg font-bold text-primary mb-1">
                      {ownedCount} / {typeSkinsArray.length}
                    </div>
                    {equippedSkin && (
                      <div className="text-xs text-muted-foreground">
                        Équipé: {equippedSkin.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default CustomizationSystem;