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
import { useFarmingPersistence } from "@/hooks/useFarmingPersistence";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShoppingBag,
  Package,
  Clock,
  Coins,
  Lock,
  Unlock,
  Gift,
  MousePointer,
  Gem,
  Star,
  TrendingUp,
  ArrowRightLeft
} from "lucide-react";

interface Seed {
  id: string;
  name: string;
  icon: any;
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


export const FarmingSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    deadspotCoins,
    zeroTokens,
    diamonds,
    experience,
    energy,
    maxEnergy,
    miningExperience,
    miningLevel,
    inventory,
    slots,
    loading,
    SEEDS,
    getRequiredExperience,
    checkMiningLevelUp,
    setDeadspotCoins,
    setZeroTokens,
    setDiamonds,
    setExperience,
    setEnergy,
    setMaxEnergy,
    setMiningExperience,
    setMiningLevel,
    setInventory,
    setSlots,
  } = useFarmingPersistence();

  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [showPayeerInfo, setShowPayeerInfo] = useState(false);
  const [lastFaucetClaim, setLastFaucetClaim] = useState<Date | null>(null);
  const [canClaim, setCanClaim] = useState(true);
  const [showExchangeDialog, setShowExchangeDialog] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState('');

  // Vérifier le cooldown du faucet (10 minutes) - Hook AVANT les conditions
  useEffect(() => {
    if (!lastFaucetClaim) {
      setCanClaim(true);
      return;
    }

    const now = new Date();
    const timeDiff = now.getTime() - lastFaucetClaim.getTime();
    const cooldownTime = 10 * 60 * 1000; // 10 minutes en millisecondes
    
    if (timeDiff < cooldownTime) {
      setCanClaim(false);
      const remainingTime = cooldownTime - timeDiff;
      
      const timer = setTimeout(() => {
        setCanClaim(true);
      }, remainingTime);
      
      return () => clearTimeout(timer);
    } else {
      setCanClaim(true);
    }
  }, [lastFaucetClaim]);

  // Régénération automatique d'énergie - TOUS LES HOOKS DOIVENT ÊTRE APPELÉS AVANT LES RETURNS
  useEffect(() => {
    const interval = setInterval(() => {
      const newEnergy = Math.min(maxEnergy, energy + 1);
      setEnergy(newEnergy);
    }, 5000); // 1 énergie toutes les 5 secondes
    
    return () => clearInterval(interval);
  }, [energy, maxEnergy, setEnergy]);

  // Si pas connecté
  if (!user) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
        <p className="text-muted-foreground">
          Vous devez être connecté pour accéder au système de ferme.
        </p>
      </Card>
    );
  }

  // Chargement
  if (loading) {
    return (
      <Card className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Chargement...</h2>
        <Progress value={50} className="w-48 mx-auto" />
      </Card>
    );
  }

  // Chargement

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

    setDeadspotCoins(deadspotCoins - totalCost);
    
    const newInventory = [...inventory];
    const existing = newInventory.find(item => item.seedId === seedId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      newInventory.push({ seedId, quantity });
    }
    setInventory(newInventory);

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
    const newSlots = slots.map(s =>
      s.id === slotId
        ? {
            ...s,
            plantedSeed: seed,
            plantedAt: new Date(),
            isGrowing: true
          }
        : s
    );
    setSlots(newSlots);

    // Retirer de l'inventaire
    const newInventory = inventory.map(item =>
      item.seedId === seedId
        ? { ...item, quantity: item.quantity - 1 }
        : item
    ).filter(item => item.quantity > 0);
    setInventory(newInventory);

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
    setZeroTokens(zeroTokens + slot.plantedSeed.reward);
    
    const newSlots = slots.map(s =>
      s.id === slotId
        ? {
            ...s,
            plantedSeed: undefined,
            plantedAt: undefined,
            isGrowing: false
          }
        : s
    );
    setSlots(newSlots);

    toast({
      title: "Récolte réussie",
      description: `+${slot.plantedSeed.reward} ZERO tokens récoltés`,
    });
  };

  const unlockSlot = (slotId: number) => {
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return;

    if (deadspotCoins >= slot.unlockPrice) {
      setDeadspotCoins(deadspotCoins - slot.unlockPrice);
      
      const newSlots = slots.map(s =>
        s.id === slotId
          ? { ...s, isUnlocked: true }
          : s
      );
      setSlots(newSlots);

      toast({
        title: "Slot débloqué!",
        description: `Slot ${slotId} débloqué pour ${slot.unlockPrice} DeadSpot Coins`,
      });
    } else {
      toast({
        title: "Fonds insuffisants",
        description: `Il vous faut ${slot.unlockPrice} DeadSpot Coins pour débloquer ce slot`,
        variant: "destructive"
      });
    }
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

  const claimFaucet = () => {
    if (!canClaim) {
      toast({
        title: "Cooldown actif",
        description: "Vous devez attendre avant de réclamer à nouveau",
        variant: "destructive"
      });
      return;
    }

    // Générer un montant aléatoire entre 0.1 et 2
    const randomAmount = Math.random() * (2 - 0.1) + 0.1;
    const roundedAmount = Math.round(randomAmount * 10) / 10; // Arrondir à 1 décimale
    
    const newDeadspotCoins = deadspotCoins + roundedAmount;
    setDeadspotCoins(newDeadspotCoins);
    setLastFaucetClaim(new Date());
    setCanClaim(false);

    toast({
      title: "Faucet réclamé!",
      description: `+${roundedAmount} DeadSpot Coins récoltés`,
    });
  };

  const getNextClaimTime = () => {
    if (!lastFaucetClaim) return null;
    
    const nextClaim = new Date(lastFaucetClaim.getTime() + 10 * 60 * 1000);
    const now = new Date();
    
    if (now >= nextClaim) return null;
    
    const diff = nextClaim.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleClick = () => {
    if (energy <= 0) {
      toast({
        title: "Énergie insuffisante",
        description: "Attendez que votre énergie se régénère",
        variant: "destructive"
      });
      return;
    }

    const coinsGained = 0.00001785;
    const diamondsGained = 0.057;
    const expGained = 0.001; // Augmenté pour le mining par click

    // Consommer de l'énergie
    const newEnergy = Math.max(0, energy - 1);
    setEnergy(newEnergy);
    
    // Ajouter les gains
    const newDeadspotCoins = deadspotCoins + coinsGained;
    const newDiamonds = diamonds + diamondsGained;
    const newExperience = experience + expGained;
    const newMiningExperience = miningExperience + expGained;
    
    setDeadspotCoins(newDeadspotCoins);
    setDiamonds(newDiamonds);
    setExperience(newExperience);
    setMiningExperience(newMiningExperience);

    // Vérifier le level up du mining
    checkMiningLevelUp(newMiningExperience, miningLevel);

    toast({
      title: "Clic récompensé!",
      description: `+${coinsGained.toFixed(8)} DSC, +${diamondsGained} 💎, +${expGained} EXP`,
    });
  };

  const handleExchange = () => {
    const amount = parseFloat(exchangeAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    if (zeroTokens < amount) {
      toast({
        title: "ZERO insuffisants",
        description: "Vous n'avez pas assez de ZERO tokens",
        variant: "destructive"
      });
      return;
    }

    // Taux d'échange configurable (ZERO valeur vraie / DSC estimé 0.20-0.75 USD)
    // Ici on utilise un taux moyen de 0.5 USD pour DSC, donc 1 ZERO = 2 DSC
    const exchangeRate = 2; // 1 ZERO = 2 DSC
    const deadspotGained = amount * exchangeRate;

    const newZeroTokens = zeroTokens - amount;
    const newDeadspotCoins = deadspotCoins + deadspotGained;

    setZeroTokens(newZeroTokens);
    setDeadspotCoins(newDeadspotCoins);

    toast({
      title: "Échange réussi!",
      description: `${amount} ZERO → ${deadspotGained} DeadSpot Coins`,
    });

    setShowExchangeDialog(false);
    setExchangeAmount('');
  };
  
  // Fonction pour échanger DeadSpot contre énergie
  const buyEnergy = () => {
    const cost = 300;
    const energyGain = 175;
    
    if (deadspotCoins < cost) {
      toast({
        title: "Fonds insuffisants",
        description: `Il vous faut ${cost} DeadSpot Coins pour acheter de l'énergie`,
        variant: "destructive"
      });
      return;
    }
    
    if (energy >= maxEnergy) {
      toast({
        title: "Énergie pleine",
        description: "Votre énergie est déjà au maximum",
        variant: "destructive"
      });
      return;
    }
    
    const newDeadspotCoins = deadspotCoins - cost;
    const newEnergy = Math.min(maxEnergy, energy + energyGain);
    
    setDeadspotCoins(newDeadspotCoins);
    setEnergy(newEnergy);
    
    toast({
      title: "Énergie achetée!",
      description: `+${energyGain} énergie pour ${cost} DeadSpot Coins`,
    });
  };


  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">DeadSpot Coins</p>
              <p className="text-lg font-bold">{deadspotCoins.toFixed(8)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">ZERO Tokens</p>
              <p className="text-lg font-bold">{zeroTokens.toFixed(8)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Gem className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="text-sm text-muted-foreground">Diamants</p>
              <p className="text-lg font-bold">{diamonds.toFixed(6)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Expérience</p>
              <p className="text-lg font-bold">{experience.toFixed(6)}</p>
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
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">Énergie</p>
              <p className="text-lg font-bold">{energy}/{maxEnergy}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
            <div>
              <p className="text-sm text-muted-foreground">Mining Level</p>
              <p className="text-lg font-bold">{miningLevel}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Barres de progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Énergie</span>
              <span>{energy}/{maxEnergy}</span>
            </div>
            <Progress value={(energy / maxEnergy) * 100} className="h-3" />
            <div className="text-xs text-muted-foreground">Régénération: +1 toutes les 5 secondes</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Expérience Mining</span>
              <span>{miningExperience.toFixed(3)}/{getRequiredExperience(miningLevel + 1)}</span>
            </div>
            <Progress value={(miningExperience / getRequiredExperience(miningLevel + 1)) * 100} className="h-3" />
            <div className="text-xs text-muted-foreground">+0.001 exp par click</div>
          </div>
        </Card>
      </div>

      {/* Bouton de clic et échange */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-dashed border-2 border-green-500/30">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <MousePointer className="h-6 w-6 text-green-500" />
              <h3 className="text-xl font-bold">Système de Clic</h3>
            </div>
            
            <p className="text-muted-foreground">
              Cliquez pour gagner des ressources
            </p>
            
            <div className="text-sm space-y-1">
              <p>🪙 +0.00001785 DeadSpot Coins</p>
              <p>💎 +0.057 Diamants</p>
              <p>⭐ +0.001 Expérience</p>
              <p>⚡ -1 Énergie</p>
            </div>
            
            <Button
              onClick={handleClick}
              size="lg"
              variant="crypto"
              className="shadow-glow"
              disabled={energy <= 0}
            >
              🖱️ Cliquer pour Récolter
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-dashed border-2 border-orange-500/30">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <h3 className="text-xl font-bold">Bonus Énergie</h3>
            </div>
            
            <p className="text-muted-foreground">
              Échangez des DSC contre de l'énergie
            </p>
            
            <div className="text-sm space-y-1">
              <p>💰 Coût: 300 DeadSpot Coins</p>
              <p>⚡ Gain: +175 énergie</p>
            </div>
            
            <Button
              onClick={buyEnergy}
              size="lg"
              variant="outline"
              className="shadow-glow"
              disabled={deadspotCoins < 300 || energy >= maxEnergy}
            >
              ⚡ Acheter Énergie
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-dashed border-2 border-blue-500/30">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <ArrowRightLeft className="h-6 w-6 text-blue-500" />
              <h3 className="text-xl font-bold">Échange ZERO → DSC</h3>
            </div>
            
            <p className="text-muted-foreground">
              Convertissez vos ZERO en DeadSpot Coins
            </p>
            
            <div className="text-sm space-y-1">
              <p>📊 Taux: 1 ZERO = 2 DSC</p>
              <p>💰 DSC estimé: 0.20-0.75 USD</p>
            </div>
            
            <Dialog open={showExchangeDialog} onOpenChange={setShowExchangeDialog}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-glow"
                  disabled={zeroTokens <= 0}
                >
                  🔄 Échanger ZERO
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Échanger ZERO contre DSC</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="exchangeAmount">Montant ZERO à échanger:</Label>
                    <Input
                      id="exchangeAmount"
                      type="number"
                      step="0.00000001"
                      value={exchangeAmount}
                      onChange={(e) => setExchangeAmount(e.target.value)}
                      placeholder="0.00000000"
                    />
                  </div>
                  
                  <div className="text-sm space-y-2">
                    <p>Balance ZERO: {zeroTokens.toFixed(8)}</p>
                    <p>Vous recevrez: {(parseFloat(exchangeAmount || '0') * 2).toFixed(8)} DSC</p>
                  </div>
                  
                  <Button onClick={handleExchange} className="w-full">
                    Confirmer l'échange
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="farm" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="farm">🚜 Ferme</TabsTrigger>
          <TabsTrigger value="shop">🛒 Boutique</TabsTrigger>
          <TabsTrigger value="inventory">📦 Inventaire</TabsTrigger>
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
                      <p className="font-bold">{slot.unlockPrice.toLocaleString()} DSC</p>
                      <Button 
                        onClick={() => unlockSlot(slot.id)}
                        size="sm"
                        className="w-full"
                        disabled={deadspotCoins < slot.unlockPrice}
                      >
                        {deadspotCoins >= slot.unlockPrice ? 'Débloquer' : 'DSC insuffisants'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SEEDS.map((seed) => (
              <Card key={seed.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-3 mb-3">
                  <seed.icon className="h-8 w-8 text-green-500" />
                  <div className="flex-1">
                    <h3 className="font-medium">{seed.name}</h3>
                    <Badge className={`text-xs ${getRarityColor(seed.rarity)} text-white`}>
                      {seed.rarity.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Prix:</span>
                    <span className="font-medium">{seed.price.toLocaleString()} DSC</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temps:</span>
                    <span>{seed.growthTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Récompense:</span>
                    <span className="font-medium text-blue-500">+{seed.reward} ZERO</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ratio:</span>
                    <span className="text-green-500">
                      {((seed.reward / seed.price) * 100).toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-3">
                  <Button
                    onClick={() => buySeeds(seed.id, 1)}
                    disabled={deadspotCoins < seed.price}
                    className="flex-1"
                    size="sm"
                  >
                    Acheter 1x
                  </Button>
                  <Button
                    onClick={() => buySeeds(seed.id, 5)}
                    disabled={deadspotCoins < seed.price * 5}
                    variant="outline"
                    size="sm"
                  >
                    5x
                  </Button>
                  <Button
                    onClick={() => buySeeds(seed.id, 10)}
                    disabled={deadspotCoins < seed.price * 10}
                    variant="outline"
                    size="sm"
                  >
                    10x
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

      {/* Faucet Section */}
      <Card className="p-6 border-dashed border-2 border-primary/30">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Gift className="h-6 w-6 text-primary" />
            <h3 className="text-xl font-bold">Faucet DeadSpot</h3>
          </div>
          
          <p className="text-muted-foreground">
            Réclamez des DeadSpot Coins gratuits toutes les 10 minutes
          </p>
          
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Récompense</p>
              <p className="text-lg font-bold text-yellow-500">0.1 - 2.0 DeadSpot</p>
            </div>
            {!canClaim && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Prochain claim</p>
                <p className="text-lg font-bold text-blue-500">{getNextClaimTime()}</p>
              </div>
            )}
          </div>
          
          <Button
            onClick={claimFaucet}
            disabled={!canClaim}
            size="lg"
            variant="crypto"
            className="shadow-glow"
          >
            {canClaim ? "🎁 Réclamer Maintenant" : `⏱️ Attendre ${getNextClaimTime()}`}
          </Button>
        </div>
      </Card>

    </div>
  );
};

export default FarmingSystem;