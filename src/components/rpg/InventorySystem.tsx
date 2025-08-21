import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Player, Equipment } from '@/types/rpg';

interface InventorySystemProps {
  player: Player;
  onEquip: (item: Equipment) => void;
  onUnequip: (type: Equipment['type']) => void;
  onBack: () => void;
}

export const InventorySystem: React.FC<InventorySystemProps> = ({
  player,
  onEquip,
  onUnequip,
  onBack
}) => {
  const getRarityColor = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'uncommon': return 'text-green-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: Equipment['type']) => {
    switch (type) {
      case 'weapon': return '⚔️';
      case 'armor': return '🛡️';
      case 'ring': return '💍';
      case 'amulet': return '🔮';
      default: return '❓';
    }
  };

  const renderStatsBonus = (stats: Partial<typeof player.currentStats>) => {
    return Object.entries(stats)
      .filter(([, value]) => value && value !== 0)
      .map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="text-green-400">+{typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}</span>
          <span className="text-muted-foreground ml-1">{key}</span>
        </div>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">🎒 Inventaire & Équipement</h2>
        <Button variant="outline" onClick={onBack}>
          ← Retour
        </Button>
      </div>

      {/* Currently Equipped */}
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle>⚔️ Équipement Actuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['weapon', 'armor', 'ring', 'amulet'] as Equipment['type'][]).map((type) => {
              const equipped = player.equipment[type];
              return (
                <Card key={type} className="hover:shadow-glow transition-all">
                  <CardContent className="p-4">
                    <div className="text-center mb-2">
                      <div className="text-2xl mb-2">{getTypeIcon(type)}</div>
                      <h4 className="font-semibold capitalize">{type === 'weapon' ? 'Arme' : type === 'armor' ? 'Armure' : type === 'ring' ? 'Anneau' : 'Amulette'}</h4>
                    </div>
                    
                    {equipped ? (
                      <div className="space-y-2">
                        <div className="text-center">
                          <div className={`font-semibold ${getRarityColor(equipped.rarity)}`}>
                            {equipped.name}
                          </div>
                          <Badge variant="outline" className="mt-1">
                            Niv. {equipped.level}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {renderStatsBonus(equipped.statsBonus)}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onUnequip(type)}
                          className="w-full"
                        >
                          Retirer
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <div className="text-sm">Aucun équipement</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Items */}
      <Card>
        <CardHeader>
          <CardTitle>📦 Inventaire ({player.inventory.length} objets)</CardTitle>
        </CardHeader>
        <CardContent>
          {player.inventory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Votre inventaire est vide
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {player.inventory.map((item) => (
                <Card key={item.id} className="hover:shadow-glow transition-all">
                  <CardContent className="p-4">
                    <div className="text-center mb-2">
                      <div className="text-2xl mb-2">{getTypeIcon(item.type)}</div>
                      <div className={`font-semibold ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </div>
                      <div className="flex justify-center gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.rarity}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Niv. {item.level}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-1 mb-3">
                      {renderStatsBonus(item.statsBonus)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mb-3">
                      {item.description}
                    </div>
                    
                    <Button
                      variant="crypto"
                      size="sm"
                      onClick={() => onEquip(item)}
                      className="w-full"
                    >
                      Équiper
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};