import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PlayerStats, Player, Enemy, PlayerClass, Equipment, CombatResult } from '@/types/rpg';
import { playerClasses, generateEnemy, baseEquipment, getEquipmentPrice } from '@/data/rpgData';
import { CharacterCreation } from './rpg/CharacterCreation';
import { CombatSystem } from './rpg/CombatSystem';
import { PlayerPanel } from './rpg/PlayerPanel';
import { InventorySystem } from './rpg/InventorySystem';
import { StatsUpgrade } from './rpg/StatsUpgrade';
import { ZeroWallet } from './rpg/ZeroWallet';
import { ShopSystem } from './rpg/ShopSystem';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RPGGame = ({ onClose }: { onClose: () => void }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [gameState, setGameState] = useState<'creation' | 'town' | 'combat' | 'inventory' | 'stats' | 'shop'>('creation');
  const { toast } = useToast();

  const createPlayer = (selectedClass: PlayerClass, name: string) => {
    const newPlayer: Player = {
      id: 'player_1',
      name,
      class: selectedClass,
      level: 1,
      experience: 0,
      experienceToNext: 100,
      baseStats: { ...selectedClass.baseStats },
      currentStats: { ...selectedClass.baseStats },
      equipment: {},
      inventory: [...baseEquipment.slice(0, 3)],
      gold: 100,
      statPoints: 0,
      enemiesDefeated: 0,
      zeroCoins: 0
    };
    setPlayer(newPlayer);
    setGameState('town');
  };

  const calculateTotalStats = (player: Player): PlayerStats => {
    let totalStats = { ...player.baseStats };
    
    Object.values(player.equipment).forEach(item => {
      if (item) {
        Object.entries(item.statsBonus).forEach(([key, value]) => {
          if (value && key in totalStats) {
            (totalStats as any)[key] += value;
          }
        });
      }
    });

    return totalStats;
  };

  const updatePlayerStats = (updatedPlayer: Player) => {
    const newStats = calculateTotalStats(updatedPlayer);
    updatedPlayer.currentStats = newStats;
    setPlayer(updatedPlayer);
  };

  const equipItem = (item: Equipment) => {
    if (!player) return;

    const newPlayer = { ...player };
    
    // Unequip current item of same type
    if (newPlayer.equipment[item.type]) {
      newPlayer.inventory.push(newPlayer.equipment[item.type]!);
    }
    
    // Equip new item
    newPlayer.equipment[item.type] = item;
    newPlayer.inventory = newPlayer.inventory.filter(i => i.id !== item.id);
    
    updatePlayerStats(newPlayer);
    toast({
      title: "Équipement équipé",
      description: `${item.name} a été équipé!`
    });
  };

  const unequipItem = (type: Equipment['type']) => {
    if (!player || !player.equipment[type]) return;

    const newPlayer = { ...player };
    const item = newPlayer.equipment[type]!;
    
    newPlayer.inventory.push(item);
    delete newPlayer.equipment[type];
    
    updatePlayerStats(newPlayer);
    toast({
      title: "Équipement retiré",
      description: `${item.name} a été retiré!`
    });
  };

  const startCombat = () => {
    if (!player) return;
    
    const enemy = generateEnemy(player.level);
    setCurrentEnemy(enemy);
    setGameState('combat');
  };

  const onCombatEnd = (result: CombatResult) => {
    if (!player) return;

    const newPlayer = { ...player };
    
    if (result.victory) {
      newPlayer.experience += result.experience;
      newPlayer.gold += result.gold;
      newPlayer.zeroCoins += result.zeroGain;
      newPlayer.enemiesDefeated += 1;
      
      if (result.equipment) {
        newPlayer.inventory.push(result.equipment);
        toast({
          title: "Objet trouvé!",
          description: `Vous avez obtenu: ${result.equipment.name}!`
        });
      }

      // Level up check
      while (newPlayer.experience >= newPlayer.experienceToNext) {
        newPlayer.experience -= newPlayer.experienceToNext;
        newPlayer.level += 1;
        newPlayer.experienceToNext = Math.floor(newPlayer.experienceToNext * 1.5);
        newPlayer.statPoints += 5;
        
        // Increase base stats on level up
        Object.keys(newPlayer.baseStats).forEach(key => {
          (newPlayer.baseStats as any)[key] += Math.floor(Math.random() * 3) + 1;
        });

        toast({
          title: "Niveau supérieur!",
          description: `Félicitations! Vous êtes maintenant niveau ${newPlayer.level}!`
        });
      }

      // Check for stat points reward (every 25 enemies)
      if (newPlayer.enemiesDefeated % 25 === 0) {
        newPlayer.statPoints += 10;
        toast({
          title: "Récompense spéciale!",
          description: "Vous avez gagné 10 points de stats pour avoir vaincu 25 ennemis!"
        });
      }

      updatePlayerStats(newPlayer);
      toast({
        title: "Victoire!",
        description: `+${result.experience} XP, +${result.gold} or, +${result.zeroGain.toFixed(6)} ZERO!`
      });
    } else {
      toast({
        title: "Défaite...",
        description: "Vous avez été vaincu! Réessayez quand vous serez plus fort.",
        variant: "destructive"
      });
    }

    setCurrentEnemy(null);
    setGameState('town');
  };

  const upgradeStats = (statName: keyof PlayerStats, points: number) => {
    if (!player || player.statPoints < points) return;

    const newPlayer = { ...player };
    newPlayer.statPoints -= points;
    (newPlayer.baseStats as any)[statName] += points;
    
    updatePlayerStats(newPlayer);
    toast({
      title: "Stats améliorées",
      description: `${statName} augmentée de ${points}!`
    });
  };

  const handleZeroWithdraw = (amount: number) => {
    if (!player) return;
    
    const newPlayer = { ...player };
    newPlayer.zeroCoins -= amount;
    updatePlayerStats(newPlayer);
  };

  const handlePurchase = (item: Equipment): boolean => {
    if (!player) return false;

    const price = getEquipmentPrice(item);
    
    if (player.level < item.level || player.gold < price) {
      return false;
    }

    const newPlayer = { ...player };
    newPlayer.gold -= price;
    newPlayer.inventory.push(item);
    
    updatePlayerStats(newPlayer);
    return true;
  };

  if (!player) {
    return <CharacterCreation classes={playerClasses} onCreatePlayer={createPlayer} />;
  }

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="container mx-auto p-4 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold gradient-text">⚔️ Monde RPG</h1>
          <div className="flex items-center gap-4">
            {/* ZERO Balance Display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <span className="text-xl">💰</span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">ZERO Balance</div>
                <div className="font-bold text-yellow-400">
                  {player.zeroCoins.toFixed(6)} ZERO
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Player Panel */}
          <div className="lg:col-span-1">
            <PlayerPanel player={player} />
          </div>

          {/* Zero Wallet */}
          <div className="lg:col-span-1">
            <ZeroWallet 
              zeroBalance={player.zeroCoins}
              onWithdraw={handleZeroWithdraw}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {gameState === 'town' && (
              <Card className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">🏰 Place du Village</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="crypto" 
                      size="xl" 
                      onClick={startCombat}
                      className="h-20"
                    >
                      ⚔️ Partir au Combat
                    </Button>
                    <Button 
                      variant="stake" 
                      size="xl" 
                      onClick={() => setGameState('inventory')}
                      className="h-20"
                    >
                      🎒 Inventaire
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="xl" 
                      onClick={() => setGameState('stats')}
                      className="h-20"
                    >
                      📊 Améliorer Stats
                      {player.statPoints > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {player.statPoints}
                        </Badge>
                      )}
                    </Button>
                    <Button 
                      variant="stake" 
                      size="xl" 
                      onClick={() => setGameState('shop')}
                      className="h-20"
                    >
                      🏪 Boutique d'Équipement
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">📈 Statistiques</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Ennemis vaincus: <Badge variant="outline">{player.enemiesDefeated}</Badge></div>
                      <div>Or: <Badge variant="outline" className="text-yellow-400">{player.gold}</Badge></div>
                      <div>Points de stats: <Badge variant="outline" className="text-green-400">{player.statPoints}</Badge></div>
                      <div>Prochaine récompense: <Badge variant="outline">{25 - (player.enemiesDefeated % 25)} ennemis</Badge></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {gameState === 'combat' && currentEnemy && (
              <CombatSystem
                player={player}
                enemy={currentEnemy}
                onCombatEnd={onCombatEnd}
                onBack={() => setGameState('town')}
              />
            )}

            {gameState === 'inventory' && (
              <InventorySystem
                player={player}
                onEquip={equipItem}
                onUnequip={unequipItem}
                onBack={() => setGameState('town')}
              />
            )}

            {gameState === 'stats' && (
              <StatsUpgrade
                player={player}
                onUpgrade={upgradeStats}
                onBack={() => setGameState('town')}
              />
            )}

            {gameState === 'shop' && (
              <ShopSystem
                player={player}
                onPurchase={handlePurchase}
                onBack={() => setGameState('town')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};