
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useFarmingData } from '@/hooks/useFarmingData';
import { Loader2 } from 'lucide-react';

interface ClickToEarnProps {
  onFreeSpinEarned?: () => void;
}

interface ClickStats {
  totalClicks: number;
  totalZeroEarned: number;
  freeSpinsEarned: number;
  clicksUntilFreeSpin: number;
}

export const ClickToEarn: React.FC<ClickToEarnProps> = ({ onFreeSpinEarned }) => {
  const [clickStats, setClickStats] = useState<ClickStats>({
    totalClicks: 0,
    totalZeroEarned: 0,
    freeSpinsEarned: 0,
    clicksUntilFreeSpin: 25
  });
  const [isClicking, setIsClicking] = useState(false);
  const [lastEarned, setLastEarned] = useState<number>(0);
  const [animatingClick, setAnimatingClick] = useState(false);

  const { addZero } = useFarmingData();
  const { toast } = useToast();

  useEffect(() => {
    loadClickStats();
  }, []);

  const loadClickStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: stats, error } = await supabase
        .from('click_to_earn_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading click stats:', error);
        return;
      }

      if (stats) {
        setClickStats({
          totalClicks: stats.total_clicks || 0,
          totalZeroEarned: Number(stats.total_zero_earned || 0),
          freeSpinsEarned: stats.free_spins_earned || 0,
          clicksUntilFreeSpin: Math.max(0, 25 - (stats.total_clicks % 25))
        });
      }
    } catch (error) {
      console.error('Error loading click stats:', error);
    }
  };

  const performClick = async () => {
    if (isClicking) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour jouer",
          variant: "destructive"
        });
        return;
      }

      setIsClicking(true);
      setAnimatingClick(true);

      // Générer un montant aléatoire entre 0.00001 et 0.2 ZERO
      const randomAmount = Math.random() * (0.2 - 0.00001) + 0.00001;
      const earnedAmount = Math.round(randomAmount * 100000) / 100000; // Arrondir à 5 décimales

      setLastEarned(earnedAmount);

      // Mettre à jour les statistiques locales
      const newTotalClicks = clickStats.totalClicks + 1;
      const newTotalZeroEarned = clickStats.totalZeroEarned + earnedAmount;
      const newClicksUntilFreeSpin = Math.max(0, 25 - (newTotalClicks % 25));
      const earnedFreeSpin = newClicksUntilFreeSpin === 0 && clickStats.clicksUntilFreeSpin !== 0;

      setClickStats({
        totalClicks: newTotalClicks,
        totalZeroEarned: newTotalZeroEarned,
        freeSpinsEarned: clickStats.freeSpinsEarned + (earnedFreeSpin ? 1 : 0),
        clicksUntilFreeSpin: newClicksUntilFreeSpin === 0 ? 25 : newClicksUntilFreeSpin
      });

      // Ajouter ZERO au portefeuille
      await addZero(earnedAmount);

      // Sauvegarder en base de données
      const { error } = await supabase
        .from('click_to_earn_stats')
        .upsert({
          user_id: user.id,
          total_clicks: newTotalClicks,
          total_zero_earned: newTotalZeroEarned,
          free_spins_earned: clickStats.freeSpinsEarned + (earnedFreeSpin ? 1 : 0),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving click stats:', error);
      }

      if (earnedFreeSpin) {
        toast({
          title: "🎉 Tour gratuit gagné !",
          description: "Vous avez gagné un tour gratuit à la roue de la fortune !",
        });
        if (onFreeSpinEarned) onFreeSpinEarned();
      }

      setTimeout(() => setAnimatingClick(false), 500);
    } catch (error) {
      console.error('Error performing click:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du clic",
        variant: "destructive"
      });
    } finally {
      setIsClicking(false);
    }
  };

  return (
    <Card className="gradient-card mb-6">
      <CardHeader className="text-center">
        <CardTitle className="text-xl gradient-text">🎯 Click to Earn ZERO</CardTitle>
        <p className="text-muted-foreground text-sm">
          Cliquez pour gagner entre 0.00001 et 0.2 ZERO • 25 clics = 1 tour gratuit
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          {/* Bouton de clic principal */}
          <div className="relative">
            <Button
              variant="crypto"
              size="xl"
              onClick={performClick}
              disabled={isClicking}
              className={`w-32 h-32 rounded-full text-lg font-bold transition-all duration-300 ${
                animatingClick ? 'scale-110 shadow-lg' : 'hover:scale-105'
              }`}
            >
              {isClicking ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <div className="text-center">
                  <div className="text-2xl mb-1">💎</div>
                  <div>CLICK</div>
                </div>
              )}
            </Button>
            
            {/* Animation du gain */}
            {animatingClick && lastEarned > 0 && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 animate-bounce">
                <div className="bg-yellow-500 text-black px-2 py-1 rounded text-sm font-bold">
                  +{lastEarned.toFixed(5)} ZERO
                </div>
              </div>
            )}
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-md">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Clics totaux</div>
              <Badge variant="outline" className="mt-1">
                {clickStats.totalClicks}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">ZERO gagné</div>
              <Badge variant="outline" className="mt-1 text-yellow-400">
                {clickStats.totalZeroEarned.toFixed(5)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Tours gratuits</div>
              <Badge variant="outline" className="mt-1 text-green-400">
                {clickStats.freeSpinsEarned}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Clics restants</div>
              <Badge variant="outline" className="mt-1 text-blue-400">
                {clickStats.clicksUntilFreeSpin}
              </Badge>
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progression vers le tour gratuit</span>
              <span>{25 - clickStats.clicksUntilFreeSpin}/25</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((25 - clickStats.clicksUntilFreeSpin) / 25) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
