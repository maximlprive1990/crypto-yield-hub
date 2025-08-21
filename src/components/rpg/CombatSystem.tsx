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

export const CombatSystem: React.FC<CombatSystemProps> = ({
  player,
  enemy,
  onCombatEnd,
  onBack
}) => {
  const [playerHealth, setPlayerHealth] = useState(player.currentStats.health);
  const [enemyHealth, setEnemyHealth] = useState(enemy.stats.health);
  const [combatLog, setCombatLog] = useState<string[]>([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [combatEnded, setCombatEnded] = useState(false);

  const calculateDamage = (attacker: any, defender: any) => {
    const baseAttack = attacker.attack || attacker.stats?.attack;
    const defense = defender.defense || defender.stats?.defense;
    const luck = attacker.luck || attacker.stats?.luck;
    
    const criticalChance = Math.min(luck / 200, 0.3);
    const isCritical = Math.random() < criticalChance;
    
    let damage = Math.max(1, baseAttack - defense * 0.5);
    if (isCritical) {
      damage *= 1.5 + (luck / 500);
    }
    
    // Check for dodge
    const dodgeChance = Math.min((defender.dodge || defender.stats?.dodge) / 300, 0.5);
    const isDodged = Math.random() < dodgeChance;
    
    if (isDodged) {
      return { damage: 0, isCritical: false, isDodged: true };
    }
    
    return { damage: Math.floor(damage), isCritical, isDodged: false };
  };

  const playerAttack = () => {
    if (combatEnded) return;
    
    const result = calculateDamage(player.currentStats, enemy.stats);
    const newEnemyHealth = Math.max(0, enemyHealth - result.damage);
    
    let logMessage = `Vous attaquez pour ${result.damage} dégâts`;
    if (result.isCritical) logMessage += ' (CRITIQUE!)';
    if (result.isDodged) logMessage = `L'ennemi esquive votre attaque!`;
    
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
    }, 1000);
  };

  const enemyAttack = (playerDamage: number) => {
    if (combatEnded) return;
    
    const result = calculateDamage(enemy.stats, player.currentStats);
    const newPlayerHealth = Math.max(0, playerHealth - result.damage);
    
    let logMessage = `${enemy.name} attaque pour ${result.damage} dégâts`;
    if (result.isCritical) logMessage += ' (CRITIQUE!)';
    if (result.isDodged) logMessage = `Vous esquivez l'attaque!`;
    
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
    
    const result: CombatResult = {
      victory,
      experience: victory ? enemy.rewards.experience : Math.floor(enemy.rewards.experience * 0.1),
      gold: victory ? enemy.rewards.gold : 0,
      equipment: victory ? enemy.rewards.dropChance : undefined,
      damage: playerDamage,
      enemyDamage
    };
    
    setTimeout(() => {
      onCombatEnd(result);
    }, 2000);
  };

  const playerHealthPercentage = (playerHealth / player.currentStats.health) * 100;
  const enemyHealthPercentage = (enemyHealth / enemy.stats.health) * 100;

  return (
    <div className="space-y-6">
      {/* Combat Arena */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="text-center text-2xl">⚔️ Combat</CardTitle>
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
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vie:</span>
                  <span>{Math.round(playerHealth)}/{Math.round(player.currentStats.health)}</span>
                </div>
                <Progress value={playerHealthPercentage} className="h-3" />
              </div>
            </div>

            {/* Enemy Side */}
            <div className="text-center">
              <div className="text-6xl mb-4 p-4 rounded-lg bg-gradient-to-br from-red-600 to-red-800">
                {enemy.icon}
              </div>
              <h3 className="text-xl font-semibold">{enemy.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">Niveau {enemy.level}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Vie:</span>
                  <span>{Math.round(enemyHealth)}/{Math.round(enemy.stats.health)}</span>
                </div>
                <Progress value={enemyHealthPercentage} className="h-3" />
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
                    disabled={!isPlayerTurn}
                  >
                    ⚔️ Attaquer
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
              </div>
            )}
            
            {combatEnded && (
              <div className="text-lg font-semibold">
                {playerHealth > 0 ? "🎉 Victoire!" : "💀 Défaite..."}
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
              <p className="text-muted-foreground text-center">Le combat commence...</p>
            ) : (
              combatLog.map((log, index) => (
                <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enemy Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">👹 Statistiques de l'Ennemi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="flex justify-between">
              <span>ATK:</span>
              <Badge variant="outline">{Math.round(enemy.stats.attack)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>DEF:</span>
              <Badge variant="outline">{Math.round(enemy.stats.defense)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>VIT:</span>
              <Badge variant="outline">{Math.round(enemy.stats.speed)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>ESQ:</span>
              <Badge variant="outline">{Math.round(enemy.stats.dodge)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>LCK:</span>
              <Badge variant="outline">{Math.round(enemy.stats.luck)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>A.SPD:</span>
              <Badge variant="outline">{enemy.stats.attackSpeed.toFixed(1)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Récompense XP:</span>
              <Badge variant="outline" className="text-green-400">{enemy.rewards.experience}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Récompense Or:</span>
              <Badge variant="outline" className="text-yellow-400">{enemy.rewards.gold}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};