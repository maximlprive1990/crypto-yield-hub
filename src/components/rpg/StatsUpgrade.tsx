import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Player, PlayerStats } from '@/types/rpg';
import { Plus, Minus } from 'lucide-react';

interface StatsUpgradeProps {
  player: Player;
  onUpgrade: (statName: keyof PlayerStats, points: number) => void;
  onBack: () => void;
}

export const StatsUpgrade: React.FC<StatsUpgradeProps> = ({
  player,
  onUpgrade,
  onBack
}) => {
  const [pendingUpgrades, setPendingUpgrades] = useState<Partial<Record<keyof PlayerStats, number>>>({});

  const statLabels: Record<keyof PlayerStats, string> = {
    attack: 'Attaque',
    speedAttack: 'Vitesse d\'Attaque',
    speedDefense: 'Vitesse de Défense',
    agility: 'Agilité',
    defense: 'Défense',
    dodge: 'Esquive',
    luck: 'Chance',
    energy: 'Énergie',
    health: 'Points de Vie',
    mana: 'Points de Mana'
  };

  const statDescriptions: Record<keyof PlayerStats, string> = {
    attack: 'Augmente les dégâts infligés aux ennemis',
    speedAttack: 'Améliore la vitesse des attaques',
    speedDefense: 'Améliore la vitesse de défense',
    agility: 'Augmente la mobilité et l\'esquive',
    defense: 'Réduit les dégâts reçus des ennemis',
    dodge: 'Augmente les chances d\'éviter les attaques',
    luck: 'Améliore les chances de coups critiques et de butin',
    energy: 'Augmente l\'énergie pour attaquer',
    health: 'Augmente les points de vie maximum',
    mana: 'Augmente les points de mana maximum'
  };

  const getTotalPointsUsed = () => {
    return Object.values(pendingUpgrades).reduce((sum, points) => sum + (points || 0), 0);
  };

  const handleStatChange = (stat: keyof PlayerStats, change: number) => {
    const current = pendingUpgrades[stat] || 0;
    const newValue = Math.max(0, current + change);
    const totalUsed = getTotalPointsUsed() - current + newValue;
    
    if (totalUsed <= player.statPoints) {
      setPendingUpgrades(prev => ({
        ...prev,
        [stat]: newValue || undefined
      }));
    }
  };

  const applyUpgrades = () => {
    Object.entries(pendingUpgrades).forEach(([stat, points]) => {
      if (points && points > 0) {
        onUpgrade(stat as keyof PlayerStats, points);
      }
    });
    setPendingUpgrades({});
  };

  const resetUpgrades = () => {
    setPendingUpgrades({});
  };

  const totalPointsUsed = getTotalPointsUsed();
  const remainingPoints = player.statPoints - totalPointsUsed;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Amélioration des Statistiques</h2>
        <Button variant="outline" onClick={onBack}>
          ← Retour
        </Button>
      </div>

      {/* Points Available */}
      <Card className="gradient-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Points Disponibles</h3>
              <p className="text-sm text-muted-foreground">
                Utilisez vos points pour améliorer vos statistiques
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  {remainingPoints} / {player.statPoints}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalPointsUsed > 0 && `${totalPointsUsed} points alloués`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Upgrade */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Statistiques Actuelles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(Object.keys(statLabels) as Array<keyof PlayerStats>).map((stat) => {
              const currentValue = Math.round(player.baseStats[stat] as number);
              const pendingPoints = pendingUpgrades[stat] || 0;
              const newValue = currentValue + pendingPoints;
              
              return (
                <div key={stat} className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold">{statLabels[stat]}</h4>
                      <p className="text-xs text-muted-foreground">{statDescriptions[stat]}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {currentValue}
                          {pendingPoints > 0 && (
                            <span className="text-green-400 ml-1">
                              → {newValue}
                            </span>
                          )}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatChange(stat, -1)}
                      disabled={pendingPoints === 0}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <div className="flex-1 text-center">
                      <Input
                        type="number"
                        min="0"
                        max={remainingPoints + pendingPoints}
                        value={pendingPoints}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const maxAllowed = remainingPoints + pendingPoints;
                          const clampedValue = Math.min(Math.max(0, value), maxAllowed);
                          setPendingUpgrades(prev => ({
                            ...prev,
                            [stat]: clampedValue || undefined
                          }));
                        }}
                        className="text-center h-8"
                      />
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatChange(stat, 1)}
                      disabled={remainingPoints === 0}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {totalPointsUsed > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4 justify-center">
              <Button
                variant="crypto"
                onClick={applyUpgrades}
                disabled={totalPointsUsed === 0}
              >
                ✨ Appliquer les Améliorations ({totalPointsUsed} points)
              </Button>
              <Button
                variant="outline"
                onClick={resetUpgrades}
              >
                🔄 Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💡 Conseils</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Vous gagnez 5 points de statistiques à chaque niveau.</p>
            <p>• Vous obtenez 10 points bonus tous les 25 ennemis vaincus.</p>
            <p>• L'attaque et la défense sont essentiels pour la survie.</p>
            <p>• La chance augmente les coups critiques et les récompenses.</p>
            <p>• L'esquive peut vous sauver contre des ennemis puissants.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};