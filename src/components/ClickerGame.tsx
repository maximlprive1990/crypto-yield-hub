import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Skull, Zap, Plus } from "lucide-react";
import skullIcon from "@/assets/skull-icon.png";

interface PowerUp {
  id: string;
  name: string;
  description: string;
  cost: number;
  effect: string;
  owned: number;
}

const ClickerGame = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  
  // Game state
  const [deadspotCoins, setDeadspotCoins] = useState(0);
  const [diamonds, setDiamonds] = useState(0);
  const [dogecoin, setDogecoin] = useState(0);
  const [expPoints, setExpPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [energy, setEnergy] = useState(500);
  const [maxEnergy, setMaxEnergy] = useState(500);
  const [clickCount, setClickCount] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [doubleClickActive, setDoubleClickActive] = useState(false);
  const [doubleClickTimer, setDoubleClickTimer] = useState(0);

  // Power-ups
  const [powerUps, setPowerUps] = useState<PowerUp[]>([
    {
      id: "double_click",
      name: "Double Click",
      description: "Double les gains pendant 30 sec",
      cost: 50,
      effect: "2x gains",
      owned: 0
    },
    {
      id: "power_click",
      name: "+3 Click Power",
      description: "Augmente définitivement les points par click",
      cost: 100,
      effect: "+3 per click",
      owned: 0
    },
    {
      id: "energy_boost",
      name: "+200 Energy",
      description: "Augmente l'énergie maximale",
      cost: 75,
      effect: "+200 max energy",
      owned: 0
    },
    {
      id: "auto_regen",
      name: "Auto Regen",
      description: "Régénération automatique d'énergie accélérée",
      cost: 200,
      effect: "+3 energy/sec",
      owned: 0
    },
    {
      id: "super_regen",
      name: "Super Regen",
      description: "Régénération d'énergie ultra rapide",
      cost: 500,
      effect: "+10 energy/sec",
      owned: 0
    }
  ]);

  // Auto energy regeneration (base)
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + 1, maxEnergy));
    }, 2000); // 1 energy every 2 seconds
    return () => clearInterval(interval);
  }, [maxEnergy]);

  // Level up effect with progressive XP requirements
  useEffect(() => {
    const expNeeded = level * 150 + (level - 1) * 50; // Progressive increase
    if (expPoints >= expNeeded) {
      setLevel(prev => prev + 1);
      setMaxEnergy(prev => prev + 50);
      setEnergy(prev => prev + 50);
      toast({
        title: t('clicker.level_up'),
        description: `${t('level')} ${level + 1} ${t('clicker.level_reached')}`,
      });
    }
  }, [expPoints, level, toast]);

  // Double click timer
  useEffect(() => {
    if (doubleClickTimer > 0) {
      const timer = setTimeout(() => {
        setDoubleClickTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDoubleClickActive(false);
    }
  }, [doubleClickTimer]);

  // Enhanced auto energy regeneration from power-ups
  useEffect(() => {
    const autoRegenOwned = powerUps.find(p => p.id === "auto_regen")?.owned || 0;
    const superRegenOwned = powerUps.find(p => p.id === "super_regen")?.owned || 0;
    const totalRegen = (autoRegenOwned * 3) + (superRegenOwned * 10);
    
    if (totalRegen > 0) {
      const interval = setInterval(() => {
        setEnergy(prev => Math.min(prev + totalRegen, maxEnergy));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [powerUps, maxEnergy]);

  const handleClick = () => {
    if (energy <= 0) {
      toast({
        title: t('clicker.no_energy'),
        description: t('clicker.wait_energy'),
        variant: "destructive"
      });
      return;
    }

    setEnergy(prev => Math.max(0, prev - 1));
    setClickCount(prev => prev + 1);

    // Calculate earnings
    const baseEarning = 0.001;
    const multiplier = doubleClickActive ? 2 : 1;
    const totalEarning = baseEarning * clickPower * multiplier;
    
    setDeadspotCoins(prev => prev + totalEarning);

    // Every 6 clicks: dogecoin + exp + diamonds
    if (clickCount % 6 === 5) {
      setDogecoin(prev => prev + 0.0000001);
      setExpPoints(prev => prev + 10);
      setDiamonds(prev => prev + 0.1);
      toast({
        title: t('clicker.bonus'),
        description: `0.0000001 DOGE + 10 ${t('exp')} + 0.1 💎 ${t('clicker.bonus_earned')}`,
      });
    }
  };

  const buyPowerUp = (powerUpId: string) => {
    const powerUp = powerUps.find(p => p.id === powerUpId);
    if (!powerUp || deadspotCoins < powerUp.cost) {
      toast({
        title: t('clicker.insufficient_funds'),
        description: `${t('clicker.need_coins')} ${powerUp?.cost} ${t('deadspot_coins')}`,
        variant: "destructive"
      });
      return;
    }

    setDeadspotCoins(prev => prev - powerUp.cost);

    switch (powerUpId) {
      case "double_click":
        setDoubleClickActive(true);
        setDoubleClickTimer(30);
        break;
      case "power_click":
        setClickPower(prev => prev + 3);
        break;
      case "energy_boost":
        setMaxEnergy(prev => prev + 200);
        setEnergy(prev => prev + 200);
        break;
    }

    setPowerUps(prev => prev.map(p => 
      p.id === powerUpId 
        ? { ...p, owned: p.owned + 1, cost: Math.floor(p.cost * 1.5) }
        : p
    ));

    toast({
      title: t('clicker.powerup_bought'),
      description: `${powerUp.name} ${t('clicker.activated')}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{deadspotCoins.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">{t('deadspot_coins')}</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{diamonds.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">{t('diamonds')}</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{dogecoin.toFixed(7)}</div>
            <div className="text-sm text-muted-foreground">DOGE</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-info">{expPoints}</div>
            <div className="text-sm text-muted-foreground">{t('exp')} ({level * 150 + (level - 1) * 50} {t('needed')})</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{level}</div>
            <div className="text-sm text-muted-foreground">{t('level')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Click Game */}
        <Card className="gradient-card border-primary/20 hover:shadow-neon transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="w-6 h-6 text-primary" />
              {t('clicker.title')}
              {doubleClickActive && (
                <Badge variant="secondary" className="ml-2">
                  Double Click: {doubleClickTimer}s
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Energy Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('clicker.energy')}</span>
                <span>{energy}/{maxEnergy}</span>
              </div>
              <Progress value={(energy / maxEnergy) * 100} className="h-3" />
            </div>

            {/* Click Button */}
            <div className="flex flex-col items-center space-y-4">
              <Button
                onClick={handleClick}
                disabled={energy <= 0}
                className="w-32 h-32 rounded-full p-0 bg-gradient-to-br from-destructive/20 to-destructive/40 border-2 border-destructive/50 hover:shadow-glow hover:scale-110 transition-smooth"
              >
                <img 
                  src={skullIcon} 
                  alt="Skull Click" 
                  className="w-20 h-20 filter drop-shadow-lg"
                />
              </Button>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">{t('clicker.click_power')}: {clickPower}</div>
                <div className="text-sm text-muted-foreground">{t('clicker.clicks')}: {clickCount}</div>
                <div className="text-sm text-muted-foreground">{t('clicker.next_bonus')}: {6 - (clickCount % 6)} clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Power-ups */}
        <Card className="gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-warning" />
              {t('clicker.powerups')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {powerUps.map((powerUp) => (
              <div key={powerUp.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex-1">
                  <div className="font-medium">{powerUp.name}</div>
                  <div className="text-sm text-muted-foreground">{powerUp.description}</div>
                  <div className="text-xs text-primary">{powerUp.effect}</div>
                  {powerUp.owned > 0 && (
                    <Badge variant="outline" className="mt-1">
                      {t('clicker.owned')}: {powerUp.owned}
                    </Badge>
                  )}
                </div>
                <Button
                  onClick={() => buyPowerUp(powerUp.id)}
                  disabled={deadspotCoins < powerUp.cost}
                  variant="outline"
                  size="sm"
                  className="ml-4"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {powerUp.cost}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClickerGame;