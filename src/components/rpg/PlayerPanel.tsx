import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/rpg';

interface PlayerPanelProps {
  player: Player;
}

export const PlayerPanel: React.FC<PlayerPanelProps> = ({ player }) => {
  const expPercentage = (player.experience / player.experienceToNext) * 100;

  return (
    <Card className="gradient-card sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${player.class.color}`}>
            {player.class.icon}
          </span>
          <div>
            <div className="text-lg">{player.name}</div>
            <div className="text-sm text-muted-foreground">{player.class.name}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level and Experience */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Niveau {player.level}</span>
            <span className="text-xs text-muted-foreground">
              {player.experience}/{player.experienceToNext} XP
            </span>
          </div>
          <Progress value={expPercentage} className="h-2" />
        </div>

        {/* Stats */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">📊 Statistiques</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between">
              <span>ATK:</span>
              <Badge variant="outline" className="text-xs h-5">{Math.round(player.currentStats.attack)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>DEF:</span>
              <Badge variant="outline" className="text-xs h-5">{Math.round(player.currentStats.defense)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>VIT:</span>
              <Badge variant="outline" className="text-xs h-5">{Math.round(player.currentStats.speed)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>ESQ:</span>
              <Badge variant="outline" className="text-xs h-5">{Math.round(player.currentStats.dodge)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>LCK:</span>
              <Badge variant="outline" className="text-xs h-5">{Math.round(player.currentStats.luck)}</Badge>
            </div>
            <div className="flex justify-between">
              <span>A.SPD:</span>
              <Badge variant="outline" className="text-xs h-5">{player.currentStats.attackSpeed.toFixed(1)}</Badge>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Vie:</span>
              <Badge variant="outline" className="text-red-400 text-xs h-5">{Math.round(player.currentStats.health)}</Badge>
            </div>
            <div className="flex justify-between text-xs">
              <span>Mana:</span>
              <Badge variant="outline" className="text-blue-400 text-xs h-5">{Math.round(player.currentStats.mana)}</Badge>
            </div>
          </div>
        </div>

        {/* Equipment */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">⚔️ Équipement</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Arme:</span>
              <span className="text-muted-foreground">
                {player.equipment.weapon?.name || 'Aucune'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Armure:</span>
              <span className="text-muted-foreground">
                {player.equipment.armor?.name || 'Aucune'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Anneau:</span>
              <span className="text-muted-foreground">
                {player.equipment.ring?.name || 'Aucun'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Amulette:</span>
              <span className="text-muted-foreground">
                {player.equipment.amulet?.name || 'Aucune'}
              </span>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">💰 Ressources</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Or:</span>
              <Badge variant="outline" className="text-yellow-400 text-xs h-5">{player.gold}</Badge>
            </div>
            <div className="flex justify-between">
              <span>Points Stats:</span>
              <Badge variant="outline" className="text-green-400 text-xs h-5">{player.statPoints}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};