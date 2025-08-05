import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Pickaxe, Gamepad2, Trophy, Zap, Bitcoin, TrendingUp } from 'lucide-react';
import { useState } from 'react';

const ComingSoonSection = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/20 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold gradient-text mb-4">
            COMING SOON!
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Phase 1 - Les prochaines semaines vont être révolutionnaires!
          </p>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            Développement en cours - Restez connectés!
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Mini-Jeux Section */}
          <Card className="border-primary/20 shadow-glow hover:shadow-neon transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Gamepad2 className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-xl">Mini-Jeux Click</CardTitle>
                  <CardDescription>Système d'upgrades et niveaux</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progression</span>
                  <span className="text-sm text-muted-foreground">75%</span>
                </div>
                <Progress value={75} className="h-2" />
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Jeux de clics interactifs</li>
                  <li>• Système d'upgrades</li>
                  <li>• Niveaux et récompenses</li>
                  <li>• Compétitions entre joueurs</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Mining Section */}
          <Card className="border-primary/20 shadow-glow hover:shadow-neon transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Pickaxe className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-xl">Mineurs & Hashrate</CardTitle>
                  <CardDescription>Mining de cryptomonnaies</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Développement</span>
                  <span className="text-sm text-muted-foreground">60%</span>
                </div>
                <Progress value={60} className="h-2" />
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Hashrate configurable (1-5)</li>
                  <li>• Mining BTC: 0.000004/30min</li>
                  <li>• Cryptos multiples</li>
                  <li>• Tableau de mining détaillé</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Bonus System */}
          <Card className="border-primary/20 shadow-glow hover:shadow-neon transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <CardTitle className="text-xl">Système de Bonus</CardTitle>
                  <CardDescription>Récompenses et expérience</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Planification</span>
                  <span className="text-sm text-muted-foreground">40%</span>
                </div>
                <Progress value={40} className="h-2" />
                <ul className="text-sm space-y-2 text-muted-foreground">
                  <li>• Expérience de mining</li>
                  <li>• Bonus quotidiens</li>
                  <li>• Récompenses de niveau</li>
                  <li>• Bonus de fidélité</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section Collapsible */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger className="flex items-center justify-center gap-2 mx-auto gradient-primary text-primary-foreground px-6 py-3 rounded-lg hover:scale-105 transition-transform">
            <span className="font-semibold">Aperçu des fonctionnalités futures</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mining Dashboard Preview */}
              <Card className="border-primary/30 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bitcoin className="h-6 w-6" />
                    Dashboard de Mining (Aperçu)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/50 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Hashrate Total</div>
                        <div className="text-xl font-bold text-primary">3.2 TH/s</div>
                      </div>
                      <div className="bg-background/50 p-3 rounded-lg">
                        <div className="text-sm text-muted-foreground">Gains 24h</div>
                        <div className="text-xl font-bold text-green-500">0.00012 BTC</div>
                      </div>
                    </div>
                    
                    <div className="bg-background/50 p-4 rounded-lg">
                      <div className="text-sm font-medium mb-2">Session de Mining Actuelle</div>
                      <div className="flex justify-between text-sm">
                        <span>Temps restant: 18:42</span>
                        <span>Crypto: BTC</span>
                      </div>
                      <Progress value={65} className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Level System Preview */}
              <Card className="border-primary/30 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Système de Niveaux (Aperçu)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">Niveau 7</div>
                      <div className="text-sm text-muted-foreground">Mineur Expérimenté</div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>XP: 2,450 / 3,000</span>
                        <span>83%</span>
                      </div>
                      <Progress value={83} className="h-3" />
                    </div>
                    
                    <div className="bg-background/50 p-3 rounded-lg">
                      <div className="text-sm font-medium">Bonus de Niveau</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        +15% Hashrate • +10% XP • Accès aux cryptos rares
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6">
                <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Phase 1 - Lancement imminent!</h3>
                <p className="text-muted-foreground">
                  Toutes ces fonctionnalités seront disponibles dans les prochaines semaines. 
                  Inscrivez-vous maintenant pour être parmi les premiers à en profiter!
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
};

export default ComingSoonSection;