import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlayerClass } from '@/types/rpg';

interface CharacterCreationProps {
  classes: PlayerClass[];
  onCreatePlayer: (selectedClass: PlayerClass, name: string) => void;
}

export const CharacterCreation: React.FC<CharacterCreationProps> = ({ classes, onCreatePlayer }) => {
  const [selectedClass, setSelectedClass] = useState<PlayerClass | null>(null);
  const [playerName, setPlayerName] = useState('');

  const handleCreate = () => {
    if (selectedClass && playerName.trim()) {
      onCreatePlayer(selectedClass, playerName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="gradient-card">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl gradient-text">⚔️ Création de Personnage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="playerName" className="text-lg font-semibold">Nom du Personnage</Label>
                <Input
                  id="playerName"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Entrez votre nom..."
                  className="mt-2 text-lg"
                />
              </div>

              <div>
                <Label className="text-lg font-semibold">Choisissez votre Classe</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {classes.map((playerClass) => (
                    <Card
                      key={playerClass.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        selectedClass?.id === playerClass.id 
                          ? 'ring-2 ring-primary shadow-neon' 
                          : 'hover:shadow-glow'
                      }`}
                      onClick={() => setSelectedClass(playerClass)}
                    >
                      <CardContent className="p-4">
                        <div className={`text-4xl text-center mb-2 p-3 rounded-lg bg-gradient-to-br ${playerClass.color}`}>
                          {playerClass.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-center">{playerClass.name}</h3>
                        <p className="text-sm text-muted-foreground text-center mb-3">
                          {playerClass.description}
                        </p>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Attaque:</span>
                            <Badge variant="outline">{playerClass.baseStats.attack}</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Défense:</span>
                            <Badge variant="outline">{playerClass.baseStats.defense}</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Vitesse:</span>
                            <Badge variant="outline">{playerClass.baseStats.speed}</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Chance:</span>
                            <Badge variant="outline">{playerClass.baseStats.luck}</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Vie:</span>
                            <Badge variant="outline">{playerClass.baseStats.health}</Badge>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Mana:</span>
                            <Badge variant="outline">{playerClass.baseStats.mana}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <Button
                  variant="crypto"
                  size="xl"
                  onClick={handleCreate}
                  disabled={!selectedClass || !playerName.trim()}
                  className="px-12"
                >
                  🌟 Créer le Personnage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};