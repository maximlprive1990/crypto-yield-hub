import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Player, Equipment } from '@/types/rpg';
import { baseEquipment, getEquipmentPrice } from '@/data/rpgData';
import { useToast } from '@/hooks/use-toast';

interface ShopSystemProps {
  player: Player;
  onPurchase: (item: Equipment) => boolean;
  onBack: () => void;
}

export const ShopSystem: React.FC<ShopSystemProps> = ({
  player,
  onPurchase,
  onBack
}) => {
  const [filterType, setFilterType] = useState<Equipment['type'] | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<Equipment['rarity'] | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'level' | 'price' | 'name'>('level');
  const { toast } = useToast();

  const getRarityColor = (rarity: Equipment['rarity']) => {
    switch (rarity) {
      case 'common': return 'text-gray-400 border-gray-400';
      case 'uncommon': return 'text-green-400 border-green-400';
      case 'rare': return 'text-blue-400 border-blue-400';
      case 'epic': return 'text-purple-400 border-purple-400';
      case 'legendary': return 'text-orange-400 border-orange-400';
      case 'silver': return 'text-slate-300 border-slate-300';
      case 'gold': return 'text-yellow-300 border-yellow-300';
      case 'platinum': return 'text-cyan-200 border-cyan-200';
      case 'sparkling': return 'text-pink-300 border-pink-300';
      case 'elite': return 'text-red-300 border-red-300';
      case 'supreme_sparkling': return 'text-rainbow border-rainbow animate-pulse';
      default: return 'text-gray-400 border-gray-400';
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

  const filteredAndSortedItems = useMemo(() => {
    let items = baseEquipment.filter(item => {
      // Filter by type
      if (filterType !== 'all' && item.type !== filterType) return false;
      
      // Filter by rarity
      if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
      
      // Filter by search term
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      
      // Don't show items already owned
      if (player.inventory.some(owned => owned.id === item.id)) return false;
      if (Object.values(player.equipment).some(equipped => equipped?.id === item.id)) return false;
      
      return true;
    });

    // Sort items
    items.sort((a, b) => {
      switch (sortBy) {
        case 'level':
          return a.level - b.level;
        case 'price':
          return getEquipmentPrice(a) - getEquipmentPrice(b);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return items;
  }, [filterType, filterRarity, searchTerm, sortBy, player.inventory, player.equipment]);

  const handlePurchase = (item: Equipment) => {
    const price = getEquipmentPrice(item);
    const priceType = item.priceType || 'gold';
    
    if (player.level < item.level) {
      toast({
        title: "Niveau insuffisant",
        description: `Vous devez être niveau ${item.level} pour acheter cet objet`,
        variant: "destructive"
      });
      return;
    }

    if (priceType === 'gold' && player.gold < price) {
      toast({
        title: "Or insuffisant",
        description: `Il vous faut ${price} or pour acheter cet objet`,
        variant: "destructive"
      });
      return;
    }

    if (priceType === 'diamonds' && player.diamonds < price) {
      toast({
        title: "Diamants insuffisants",
        description: `Il vous faut ${price} diamants pour acheter cet objet`,
        variant: "destructive"
      });
      return;
    }

    const success = onPurchase(item);
    if (success) {
      const currency = priceType === 'diamonds' ? 'diamants' : 'or';
      toast({
        title: "Achat réussi!",
        description: `Vous avez acheté ${item.name} pour ${price} ${currency}!`
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold gradient-text">🏪 Boutique d'Équipement</h2>
        <Button variant="outline" onClick={onBack}>
          ← Retour
        </Button>
      </div>

      {/* Player Info */}
      <Card className="gradient-card">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">Votre niveau:</span>
              <Badge variant="outline" className="ml-2">Niveau {player.level}</Badge>
            </div>
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Votre or:</span>
                <Badge variant="outline" className="ml-2 text-yellow-400">{player.gold} or</Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Vos diamants:</span>
                <Badge variant="outline" className="ml-2 text-cyan-400">{player.diamonds} 💎</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🔍 Filtres et Recherche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Rechercher</label>
              <Input
                placeholder="Nom de l'objet..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="weapon">⚔️ Armes</SelectItem>
                  <SelectItem value="armor">🛡️ Armures</SelectItem>
                  <SelectItem value="ring">💍 Anneaux</SelectItem>
                  <SelectItem value="amulet">🔮 Amulettes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rareté</label>
              <Select value={filterRarity} onValueChange={(value: any) => setFilterRarity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les raretés</SelectItem>
                  <SelectItem value="common">Commun</SelectItem>
                  <SelectItem value="uncommon">Inhabituel</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="epic">Épique</SelectItem>
                  <SelectItem value="legendary">Légendaire</SelectItem>
                  <SelectItem value="silver">Argent</SelectItem>
                  <SelectItem value="gold">Or</SelectItem>
                  <SelectItem value="platinum">Platine</SelectItem>
                  <SelectItem value="sparkling">Étincelant</SelectItem>
                  <SelectItem value="elite">Élite</SelectItem>
                  <SelectItem value="supreme_sparkling">Suprême Étincelant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Trier par</label>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="level">Niveau requis</SelectItem>
                  <SelectItem value="price">Prix</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shop Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>📦 Objets Disponibles</span>
            <Badge variant="outline">{filteredAndSortedItems.length} objets</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <div className="text-6xl mb-4">🤷‍♂️</div>
              <p className="text-lg mb-2">Aucun objet trouvé</p>
              <p className="text-sm">Modifiez vos filtres ou revenez plus tard!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedItems.map((item) => {
                const price = getEquipmentPrice(item);
                const priceType = item.priceType || 'gold';
                const canAfford = priceType === 'diamonds' ? player.diamonds >= price : player.gold >= price;
                const levelReq = player.level >= item.level;
                const canBuy = canAfford && levelReq;

                return (
                  <Card key={item.id} className={`hover:shadow-glow transition-all ${canBuy ? '' : 'opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-2">{getTypeIcon(item.type)}</div>
                        <div className={`font-semibold ${getRarityColor(item.rarity).split(' ')[0]}`}>
                          {item.name}
                        </div>
                        <div className="flex justify-center gap-1 mt-1 flex-wrap">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getRarityColor(item.rarity)}`}
                          >
                            {item.rarity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Niv. {item.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1 mb-3 min-h-[80px]">
                        {renderStatsBonus(item.statsBonus)}
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-3 min-h-[32px]">
                        {item.description}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>Prix:</span>
                          <Badge variant="outline" className={priceType === 'diamonds' ? "text-cyan-400" : "text-yellow-400"}>
                            {price} {priceType === 'diamonds' ? '💎' : 'or'}
                          </Badge>
                        </div>
                        
                        {!levelReq && (
                          <div className="text-xs text-red-400 text-center">
                            Niveau {item.level} requis
                          </div>
                        )}
                        
                        {!canAfford && levelReq && (
                          <div className="text-xs text-red-400 text-center">
                            {priceType === 'diamonds' ? 'Diamants insuffisants' : 'Or insuffisant'}
                          </div>
                        )}
                        
                        <Button
                          variant={canBuy ? "crypto" : "outline"}
                          size="sm"
                          onClick={() => handlePurchase(item)}
                          disabled={!canBuy}
                          className="w-full"
                        >
                          {canBuy ? "Acheter" : "Indisponible"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🏷️ Légende des Raretés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-gray-400 border-gray-400">Commun</Badge>
              <span className="text-muted-foreground">Prix x1</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-green-400 border-green-400">Inhabituel</Badge>
              <span className="text-muted-foreground">Prix x2.5</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-400 border-blue-400">Rare</Badge>
              <span className="text-muted-foreground">Prix x6</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-400 border-purple-400">Épique</Badge>
              <span className="text-muted-foreground">Prix x15</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-400 border-orange-400">Légendaire</Badge>
              <span className="text-muted-foreground">Prix x40</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};