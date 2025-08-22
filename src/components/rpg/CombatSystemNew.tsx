import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Player, Enemy, CombatResult } from '@/types/rpg';

interface CombatSystemProps {
  player: Player;
  enemy: Enemy;
  onCombatEnd: (result: CombatResult) => void;
  onBack: () => void;
}

export const CombatSystemNew: React.FC<CombatSystemProps> = ({
  player,
  enemy,
  onCombatEnd,
  onBack
}) => {
  const [playerHealth, setPlayerHealth] = useState(player.currentStats.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.stats.health);
  const [playerEnergy, setPlayerEnergy] = useState(player.currentStats.energy);
  const [enemyEnergy, setEnemyEnergy] = useState(enemy.stats.energy);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatEnded, setCombatEnded] = useState(false);
  const [totalEnergyUsed, setTotalEnergyUsed] = useState(0);

  // Energy regeneration every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!combatEnded) {
        setPlayerEnergy(prev => Math.min(player.currentStats.energy, prev + 5));
        setEnemyEnergy(prev => Math.min(enemy.stats.energy, prev + 5));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [combatEnded, player.currentStats.energy, enemy.stats.energy]);

  const calculateDamage = (attacker: any, defender: any, isPlayer: boolean = true) => {
    const attackStat = attacker.attack;
    const defenseStat = defender.defense;
    const speedAttackStat = attacker.speedAttack;
    const speedDefenseStat = defender.speedDefense;
    const luckStat = attacker.luck;
    const dodgeStat = defender.dodge;
    const agilityStat = defender.agility;

    // Base damage calculation
    let baseDamage = Math.max(1, attackStat - defenseStat * 0.4);
    
    // Speed attack vs speed defense
    const speedAdvantage = Math.max(0, speedAttackStat - speedDefenseStat) * 0.3;
    baseDamage += speedAdvantage;

    // Critical hit calculation (luck influences crit chance)
    const critChance = Math.min(luckStat / 400, 0.35); // Max 35% crit chance
    const isCritical = Math.random() < critChance;
    
    if (isCritical) {
      baseDamage *= 1.8 + (luckStat / 1000); // Crit multiplier
    }

    // Dodge calculation (agility + dodge)
    const totalDodge = dodgeStat + agilityStat * 0.5;
    const dodgeChance = Math.min(totalDodge / 600, 0.45); // Max 45% dodge chance
    const isDodged = Math.random() < dodgeChance;

    if (isDodged) {
      return { damage: 0, isCritical: false, isDodged: true };
    }

    return { 
      damage: Math.floor(baseDamage), 
      isCritical, 
      isDodged: false 
    };
  };

  const playerAttack = () => {
    if (combatEnded || !isPlayerTurn || playerEnergy < 15) return;
    
    const energyCost = 15;
    setPlayerEnergy(prev => prev - energyCost);
    setTotalEnergyUsed(prev => prev + energyCost);
    
    const result = calculateDamage(player.currentStats, enemy.stats, true);
    const newEnemyHealth = Math.max(0, enemyHealth - result.damage);
    
    let logMessage = `🗡️ Vous attaquez pour ${result.damage} dégâts`;
    if (result.isCritical) logMessage += ' (CRITIQUE! ⚡)';
    if (result.isDodged) logMessage = `🌪️ ${enemy.name} esquive votre attaque!`;
    
    setCombatLog(prev => [...prev, logMessage]);
    setEnemyHealth(newEnemyHealth);
    
    if (newEnemyHealth <= 0) {
      endCombat(true, result.damage, 0);
      return;
    }
    
    setIsPlayerTurn(false);
    
    // Enemy turn after delay
    setTimeout(() => {
      enemyAttack(result.damage);
    }, 1500);
  };

  const enemyAttack = (playerDamage: number) => {
    if (combatEnded || enemyEnergy < 12) {
      setIsPlayerTurn(true);
      return;
    }
    
    setEnemyEnergy(prev => prev - 12);
    
    const result = calculateDamage(enemy.stats, player.currentStats, false);
    const newPlayerHealth = Math.max(0, playerHealth - result.damage);
    
    let logMessage = `👹 ${enemy.name} attaque pour ${result.damage} dégâts`;
    if (result.isCritical) logMessage += ' (CRITIQUE! ⚡)';
    if (result.isDodged) logMessage = `🌪️ Vous esquivez l'attaque de ${enemy.name}!`;
    
    setCombatLog(prev => [...prev, logMessage]);
    setPlayerHealth(newPlayerHealth);
    
    if (newPlayerHealth <= 0) {
      endCombat(false, playerDamage, result.damage);
      return;
    }
    
    setIsPlayerTurn(true);
  };

  const endCombat = (victory: boolean, playerDamage: number, enemyDamage: number) => {
    setCombatEnded(true);
    
    // Generate ZERO gain for victory
    const zeroGain = victory ? (Math.random() * 0.000999 + 0.000001) : 0;
    
    const result: CombatResult = {
      victory,
      experience: victory ? enemy.rewards.experience : Math.round(enemy.rewards.experience * 0.1 * 100) / 100,
      gold: victory ? enemy.rewards.gold : 0,
      zeroGain,
      equipment: victory ? enemy.rewards.dropChance : undefined,
      damage: playerDamage,
      enemyDamage,
      energyUsed: totalEnergyUsed
    };
    
    setTimeout(() => {
      onCombatEnd(result);
    }, 2000);
  };

  const playerHealthPercentage = (playerHealth / player.currentStats.health) * 100;
  const enemyHealthPercentage = (enemyHealth / enemy.stats.health) * 100;
  const playerEnergyPercentage = (playerEnergy / player.currentStats.energy) * 100;
  const enemyEnergyPercentage = (enemyEnergy / enemy.stats.energy) * 100;

  const canAttack = isPlayerTurn && playerEnergy >= 15 && !combatEnded;

  return (
    <div className="space-y-6">
      {/* Combat Arena */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-center text-2xl">⚔️ Combat Épique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Player Side */}
            <div className="text-center">
              <div className={`text-6xl mb-4 p-4 rounded-lg bg-gradient-to-br ${player.class.color}`}>
                {player.class.icon}
              </div>
              <h3 className="text-xl font-semibold">{player.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Niveau {player.level}</p>
              
              <div className="space-y-3">
                {/* Health */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>❤️ Vie:</span>
                    <span className="text-red-400">{Math.round(playerHealth)}/{Math.round(player.currentStats.health)}</span>
                  </div>
                  <Progress value={playerHealthPercentage} className="h-3 bg-red-950">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300" 
                         style={{ width: `${playerHealthPercentage}%` }} />
                  </Progress>
                </div>
                
                {/* Energy */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>⚡ Énergie:</span>
                    <span className="text-blue-400">{Math.round(playerEnergy)}/{Math.round(player.currentStats.energy)}</span>
                  </div>
                  <Progress value={playerEnergyPercentage} className="h-3 bg-blue-950">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300" 
                         style={{ width: `${playerEnergyPercentage}%` }} />
                  </Progress>
                </div>
              </div>
            </div>

            {/* Enemy Side */}
            <div className="text-center">
              <div className="text-6xl mb-4 p-4 rounded-lg bg-gradient-to-br from-red-600 to-red-800">
                {enemy.icon}
              </div>
              <h3 className="text-xl font-semibold">{enemy.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Niveau {enemy.level}</p>
              
              <div className="space-y-3">
                {/* Health */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>❤️ Vie:</span>
                    <span className="text-red-400">{Math.round(enemyHealth)}/{Math.round(enemy.stats.health)}</span>
                  </div>
                  <Progress value={enemyHealthPercentage} className="h-3 bg-red-950">
                    <div className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-300" 
                         style={{ width: `${enemyHealthPercentage}%` }} />
                  </Progress>
                </div>
                
                {/* Energy */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>⚡ Énergie:</span>
                    <span className="text-blue-400">{Math.round(enemyEnergy)}/{Math.round(enemy.stats.energy)}</span>
                  </div>
                  <Progress value={enemyEnergyPercentage} className="h-3 bg-blue-950">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-300" 
                         style={{ width: `${enemyEnergyPercentage}%` }} />
                  </Progress>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Actions */}
          <div className="mt-6 text-center">
            {!combatEnded && (
              <div className="space-y-4">
                <div className="text-lg font-semibold">
                  {isPlayerTurn ? "🗡️ À votre tour!" : "⏳ Tour de l'ennemi..."}
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button
                    variant="crypto"
                    size="lg"
                    onClick={playerAttack}
                    disabled={!canAttack}
                    className={`transition-all ${canAttack ? 'hover:scale-105 shadow-glow' : 'opacity-50'}`}
                  >
                    ⚔️ Attaquer (15 ⚡)
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={onBack}
                    disabled={!isPlayerTurn}
                  >
                    🏃 Fuir
                  </Button>
                </div>
                
                {playerEnergy < 15 && isPlayerTurn && (
                  <p className="text-yellow-400 text-sm">
                    ⚡ Énergie insuffisante! (Régénération: +5 toutes les 3s)
                  </p>
                )}
              </div>
            )}
            
            {combatEnded && (
              <div className="text-lg font-semibold">
                {playerHealth > 0 ? "🎉 Victoire Éclatante!" : "💀 Défaite Honorable..."}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Combat Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📜 Journal de Combat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {combatLog.length === 0 ? (
              <p className="text-muted-foreground text-center">⚔️ Le combat épique commence...</p>
            ) : (
              combatLog.slice(-8).map((log, index) => (
                <div key={index} className="text-sm p-2 bg-muted/50 rounded transition-all hover:bg-muted/70">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Stats Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🛡️ Vos Statistiques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>⚔️ ATK:</span>
                <Badge variant="outline" className="text-red-400">{Math.round(player.currentStats.attack)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🛡️ DEF:</span>
                <Badge variant="outline" className="text-blue-400">{Math.round(player.currentStats.defense)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>⚡ S.ATK:</span>
                <Badge variant="outline" className="text-yellow-400">{Math.round(player.currentStats.speedAttack)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🛡️ S.DEF:</span>
                <Badge variant="outline" className="text-green-400">{Math.round(player.currentStats.speedDefense)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🏃 AGL:</span>
                <Badge variant="outline" className="text-purple-400">{Math.round(player.currentStats.agility)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🌪️ ESQ:</span>
                <Badge variant="outline" className="text-cyan-400">{Math.round(player.currentStats.dodge)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🍀 LCK:</span>
                <Badge variant="outline" className="text-orange-400">{Math.round(player.currentStats.luck)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>⚡ ENG:</span>
                <Badge variant="outline" className="text-blue-300">{Math.round(playerEnergy)}/{Math.round(player.currentStats.energy)}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enemy Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">👹 Statistiques Ennemies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>⚔️ ATK:</span>
                <Badge variant="outline" className="text-red-400">{Math.round(enemy.stats.attack)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🛡️ DEF:</span>
                <Badge variant="outline" className="text-blue-400">{Math.round(enemy.stats.defense)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>⚡ S.ATK:</span>
                <Badge variant="outline" className="text-yellow-400">{Math.round(enemy.stats.speedAttack)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🛡️ S.DEF:</span>
                <Badge variant="outline" className="text-green-400">{Math.round(enemy.stats.speedDefense)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🏃 AGL:</span>
                <Badge variant="outline" className="text-purple-400">{Math.round(enemy.stats.agility)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🌪️ ESQ:</span>
                <Badge variant="outline" className="text-cyan-400">{Math.round(enemy.stats.dodge)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>🍀 LCK:</span>
                <Badge variant="outline" className="text-orange-400">{Math.round(enemy.stats.luck)}</Badge>
              </div>
              <div className="flex justify-between">
                <span>⚡ ENG:</span>
                <Badge variant="outline" className="text-blue-300">{Math.round(enemyEnergy)}/{Math.round(enemy.stats.energy)}</Badge>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-muted/30">
              <div className="flex justify-between text-sm">
                <span>🎯 Récompense XP:</span>
                <Badge variant="outline" className="text-green-400">{enemy.rewards.experience}</Badge>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>💰 Récompense Or:</span>
                <Badge variant="outline" className="text-yellow-400">{enemy.rewards.gold}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};