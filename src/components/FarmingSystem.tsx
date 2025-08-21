import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Wheat, 
  Carrot, 
  Salad, 
  Cherry,
  ShoppingBag,
  Package,
  Clock,
  Coins,
  Lock,
  Unlock
} from "lucide-react";

interface Seed {
  id: string;
  name: string;
  icon: typeof Wheat;
  price: number;
  growthTime: number; // en minutes
  reward: number; // ZERO tokens
  rarity: "common" | "rare" | "epic" | "legendary";
}

interface FarmSlot {
  id: number;
  isUnlocked: boolean;
  unlockPrice: number;
  plantedSeed?: Seed;
  plantedAt?: Date;
  isGrowing: boolean;
}

interface InventoryItem {
  seedId: string;
  quantity: number;
}

const SEEDS: Seed[] = [
  {
    id: "wheat",
    name: "Blé",
    icon: Wheat,
    price: 100,
    growthTime: 30,
    reward: 5,
    rarity: "common"
  },
  {
    id: "carrot",
    name: "Carotte",
    icon: Carrot,
    price: 150,
    growthTime: 45,
    reward: 8,
    rarity: "common"
  },
  {
    id: "lettuce",
    name: "Courgette",
    icon: Salad,
    price: 200,
    growthTime: 60,
    reward: 12,
    rarity: "rare"
  },
  {
    id: "tomato",
    name: "Tomate",
    icon: Cherry,
    price: 300,
    growthTime: 90,
    reward: 20,
    rarity: "epic"
  }
];

export const FarmingSystem = () => {
  const { toast } = useToast();
  const [deadspotCoins, setDeadspotCoins] = useState(500); // Exemple
  const [zeroTokens, setZeroTokens] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [slots, setSlots] = useState<FarmSlot[]>([
    { id: 1, isUnlocked: true, unlockPrice: 0, isGrowing: false },
    { id: 2, isUnlocked: false, unlockPrice: 1, isGrowing: false },
    { id: 3, isUnlocked: false, unlockPrice: 2, isGrowing: false },
    { id: 4, isUnlocked: false, unlockPrice: 3, isGrowing: false },
    { id: 5, isUnlocked: false, unlockPrice: 4, isGrowing: false },
    { id: 6, isUnlocked: false, unlockPrice: 5, isGrowing: false }
  ]);

  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showPayeerInfo, setShowPayeerInfo] = useState(false);

  // Vérifier la croissance des plantes
  useEffect(() => {
    const interval = setInterval(() => {
      setSlots(prevSlots =>
        prevSlots.map(slot => {
          if (slot.plantedSeed && slot.plantedAt && !slot.isGrowing) {
            const now = new Date();
            const plantedTime = new Date(slot.plantedAt);
            const elapsedMinutes = (now.getTime() - plantedTime.getTime()) / (1000 * 60);
            
            if (elapsedMinutes >= slot.plantedSeed.growthTime) {
              return { ...slot, isGrowing: false };
            }
          }
          return slot;
        })
      );
    }, 10000); // Vérifier toutes les 10 secondes

    return () => clearInterval(interval);
  }, []);

  const buySeeds = (seedId: string, quantity: number) => {
    const seed = SEEDS.find(s => s.id === seedId);
    if (!seed) return;

    const totalCost = seed.price * quantity;
    if (deadspotCoins < totalCost) {
      toast({
        title: "Fonds insuffisants",
        description: "Vous n'avez pas assez de DeadSpot Coins",
        variant: "destructive"
      });
      return;
    }

    setDeadspotCoins(prev => prev - totalCost);
    setInventory(prev => {
      const existing = prev.find(item => item.seedId === seedId);
      if (existing) {
        return prev.map(item =>
          item.seedId === seedId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { seedId, quantity }];
    });

    toast({
      title: "Achat réussi",
      description: `${quantity}x ${seed.name} acheté(es)`,
    });
  };

  const plantSeed = (slotId: number, seedId: string) => {
    const slot = slots.find(s => s.id === slotId);
    const seed = SEEDS.find(s => s.id === seedId);
    const inventoryItem = inventory.find(item => item.seedId === seedId);

    if (!slot?.isUnlocked || !seed || !inventoryItem || inventoryItem.quantity < 1) {
      toast({
        title: "Impossible de planter",
        description: "Vérifiez vos graines disponibles",
        variant: "destructive"
      });
      return;
    }

    if (slot.plantedSeed) {
      toast({
        title: "Slot occupé",
        description: "Ce slot contient déjà une plante",
        variant: "destructive"
      });
      return;
    }

    // Planter la graine
    setSlots(prev =>
      prev.map(s =>
        s.id === slotId
          ? {
              ...s,
              plantedSeed: seed,
              plantedAt: new Date(),
              isGrowing: true
            }
          : s
      )
    );

    // Retirer de l'inventaire
    setInventory(prev =>
      prev.map(item =>
        item.seedId === seedId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      ).filter(item => item.quantity > 0)
    );

    toast({
      title: "Graine plantée",
      description: `${seed.name} planté dans le slot ${slotId}`,
    });
  };

  const harvest = (slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot?.plantedSeed || !slot.plantedAt) return;

    const now = new Date();
    const plantedTime = new Date(slot.plantedAt);
    const elapsedMinutes = (now.getTime() - plantedTime.getTime()) / (1000 * 60);

    if (elapsedMinutes < slot.plantedSeed.growthTime) {
      toast({
        title: "Pas encore prêt",
        description: "La plante n'est pas encore mature",
        variant: "destructive"
      });
      return;
    }

    // Récolter
    setZeroTokens(prev => prev + slot.plantedSeed!.reward);
    setSlots(prev =>
      prev.map(s =>
        s.id === slotId
          ? {
              ...s,
              plantedSeed: undefined,
              plantedAt: undefined,
              isGrowing: false
            }
          : s
      )
    );

    toast({
      title: "Récolte réussie",
      description: `+${slot.plantedSeed.reward} ZERO tokens récoltés`,
    });
  };

  const unlockSlot = (slotId: number) => {
    setSelectedSlot(slotId);
    setShowPayeerInfo(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  const getGrowthProgress = (slot: FarmSlot) => {
    if (!slot.plantedSeed || !slot.plantedAt) return 0;
    
    const now = new Date();
    const plantedTime = new Date(slot.plantedAt);
    const elapsedMinutes = (now.getTime() - plantedTime.getTime()) / (1000 * 60);
    const progress = Math.min((elapsedMinutes / slot.plantedSeed.growthTime) * 100, 100);
    
    return progress;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">DeadSpot Coins</p>
              <p className="text-lg font-bold">{deadspotCoins.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">ZERO Tokens</p>
              <p className="text-lg font-bold">{zeroTokens.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Graines</p>
              <p className="text-lg font-bold">
                {inventory.reduce((sum, item) => sum + item.quantity, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="farm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="farm">Ferme</TabsTrigger>
          <TabsTrigger value="shop">Boutique</TabsTrigger>
          <TabsTrigger value="inventory">Inventaire</TabsTrigger>
        </TabsList>

        <TabsContent value="farm" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {slots.map((slot) => (
              <Card key={slot.id} className="p-4 relative">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">Slot {slot.id}</Badge>
                    {slot.isUnlocked ? (
                      <Unlock className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-red-500" />
                    )}
                  </div>

                  {!slot.isUnlocked ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Débloqué pour</p>
                      <p className="font-bold">${slot.unlockPrice} USD</p>
                      <Button 
                        onClick={() => unlockSlot(slot.id)}
                        size="sm"
                        className="w-full"
                      >
                        Débloquer
                      </Button>
                    </div>
                  ) : slot.plantedSeed ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center">
                        <slot.plantedSeed.icon className="h-8 w-8 text-green-500" />
                      </div>
                      <p className="font-medium">{slot.plantedSeed.name}</p>
                      <Progress value={getGrowthProgress(slot)} className="w-full" />
                      <div className="flex items-center justify-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <p className="text-xs">
                          {getGrowthProgress(slot) === 100 ? "Prêt!" : `${slot.plantedSeed.growthTime} min`}
                        </p>
                      </div>
                      {getGrowthProgress(slot) === 100 ? (
                        <Button 
                          onClick={() => harvest(slot.id)}
                          size="sm"
                          className="w-full"
                        >
                          Récolter (+{slot.plantedSeed.reward} ZERO)
                        </Button>
                      ) : (
                        <p className="text-xs text-muted-foreground">En croissance...</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="h-12 w-12 bg-muted rounded-full mx-auto flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">Slot libre</p>
                      {inventory.length > 0 && (
                        <div className="space-y-1">
                          {inventory.map((item) => {
                            const seed = SEEDS.find(s => s.id === item.seedId);
                            if (!seed) return null;
                            return (
                              <Button
                                key={item.seedId}
                                variant="outline"
                                size="sm"
                                onClick={() => plantSeed(slot.id, item.seedId)}
                                className="w-full text-xs"
                              >
                                Planter {seed.name}
                              </Button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="shop" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SEEDS.map((seed) => (
              <Card key={seed.id} className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <seed.icon className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <h3 className="font-medium">{seed.name}</h3>
                    <Badge className={`text-xs ${getRarityColor(seed.rarity)} text-white`}>
                      {seed.rarity}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix:</span>
                    <span className="font-medium">{seed.price} DeadSpot</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps:</span>
                    <span>{seed.growthTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Récompense:</span>
                    <span className="font-medium text-blue-500">+{seed.reward} ZERO</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    onClick={() => buySeeds(seed.id, 1)}
                    disabled={deadspotCoins < seed.price}
                    className="flex-1"
                  >
                    Acheter 1x
                  </Button>
                  <Button
                    onClick={() => buySeeds(seed.id, 5)}
                    disabled={deadspotCoins < seed.price * 5}
                    variant="outline"
                  >
                    5x
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {inventory.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Votre inventaire est vide</p>
              <p className="text-sm text-muted-foreground">Achetez des graines dans la boutique</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {inventory.map((item) => {
                const seed = SEEDS.find(s => s.id === item.seedId);
                if (!seed) return null;
                
                return (
                  <Card key={item.seedId} className="p-4">
                    <div className="flex items-center space-x-3">
                      <seed.icon className="h-8 w-8 text-green-500" />
                      <div className="flex-1">
                        <h3 className="font-medium">{seed.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog pour débloquer un slot */}
      <Dialog open={showPayeerInfo} onOpenChange={setShowPayeerInfo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Débloquer le Slot {selectedSlot}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Pour débloquer ce slot, effectuez un dépôt de{" "}
              <span className="font-bold">
                ${slots.find(s => s.id === selectedSlot)?.unlockPrice} USD
              </span>{" "}
              sur le compte Payeer suivant :
            </p>
            
            <Card className="p-4 bg-muted">
              <div className="space-y-2">
                <Label>Compte Payeer :</Label>
                <div className="flex items-center space-x-2">
                  <Input value="P1112145219" readOnly />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText("P1112145219");
                      toast({
                        title: "Copié",
                        description: "Numéro de compte copié dans le presse-papiers",
                      });
                    }}
                  >
                    Copier
                  </Button>
                </div>
              </div>
            </Card>

            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Instructions :</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Connectez-vous à votre compte Payeer</li>
                <li>Effectuez un transfert vers le compte P1112145219</li>
                <li>Le slot sera débloqué automatiquement après vérification</li>
                <li>Temps de traitement : 5-30 minutes</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};