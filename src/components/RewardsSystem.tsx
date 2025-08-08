import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Gift, Trophy, Calendar, Star, Zap, Award, Crown } from "lucide-react";

interface DailyBonus {
  day: number;
  reward: string;
  claimed: boolean;
  multiplier: number;
}

interface LevelReward {
  level: number;
  reward: string;
  unlocked: boolean;
  claimed: boolean;
}

interface FidelityBonus {
  days: number;
  reward: string;
  unlocked: boolean;
}

const RewardsSystem = ({
  deadspotCoins,
  setDeadspotCoins,
  diamonds,
  setDiamonds,
  miningExp,
  setMiningExp,
  level,
  setLevel
}: {
  deadspotCoins: number;
  setDeadspotCoins: (value: number | ((prev: number) => number)) => void;
  diamonds: number;
  setDiamonds: (value: number | ((prev: number) => number)) => void;
  miningExp: number;
  setMiningExp: (value: number | ((prev: number) => number)) => void;
  level: number;
  setLevel: (value: number | ((prev: number) => number)) => void;
}) => {
  const { toast } = useToast();

  // Daily bonus system
  const [dailyBonuses, setDailyBonuses] = useState<DailyBonus[]>([
    { day: 1, reward: "10 DeadSpot + 5 💎", claimed: false, multiplier: 1 },
    { day: 2, reward: "15 DeadSpot + 8 💎", claimed: false, multiplier: 1.2 },
    { day: 3, reward: "25 DeadSpot + 12 💎", claimed: false, multiplier: 1.5 },
    { day: 4, reward: "40 DeadSpot + 20 💎", claimed: false, multiplier: 1.8 },
    { day: 5, reward: "60 DeadSpot + 30 💎", claimed: false, multiplier: 2 },
    { day: 6, reward: "100 DeadSpot + 50 💎", claimed: false, multiplier: 2.5 },
    { day: 7, reward: "200 DeadSpot + 100 💎", claimed: false, multiplier: 3 },
  ]);

  // Level rewards
  const [levelRewards, setLevelRewards] = useState<LevelReward[]>([
    { level: 5, reward: "50 💎 + Power-up gratuit", unlocked: false, claimed: false },
    { level: 10, reward: "100 💎 + Mineur gratuit", unlocked: false, claimed: false },
    { level: 15, reward: "200 💎 + Double XP 24h", unlocked: false, claimed: false },
    { level: 20, reward: "500 💎 + Titre spécial", unlocked: false, claimed: false },
    { level: 25, reward: "1000 💎 + Skin exclusif", unlocked: false, claimed: false },
    { level: 30, reward: "2000 💎 + Bonus permanent", unlocked: false, claimed: false },
  ]);

  // Fidelity bonuses
  const [fidelityBonuses, setFidelityBonuses] = useState<FidelityBonus[]>([
    { days: 7, reward: "Bonus débutant: +10% XP", unlocked: false },
    { days: 30, reward: "Bonus mensuel: +20% gains", unlocked: false },
    { days: 90, reward: "Bonus trimestre: +30% mining", unlocked: false },
    { days: 180, reward: "Bonus semestre: Mineur légendaire", unlocked: false },
    { days: 365, reward: "Bonus annuel: Accès VIP", unlocked: false },
  ]);

  // Game states
  const [currentStreak, setCurrentStreak] = useState(1);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [totalDaysPlayed, setTotalDaysPlayed] = useState(1);
  const [doubleXpActive, setDoubleXpActive] = useState(false);
  const [doubleXpTimer, setDoubleXpTimer] = useState(0);

  // Mining experience system
  const expToNextLevel = level * 200 + (level - 1) * 100;
  const expProgress = (miningExp / expToNextLevel) * 100;

  // Auto mining experience gain
  useEffect(() => {
    const interval = setInterval(() => {
      const baseExp = 5;
      const multiplier = doubleXpActive ? 2 : 1;
      setMiningExp(prev => prev + (baseExp * multiplier));
    }, 10000); // +5 exp every 10 seconds (or +10 with double XP)

    return () => clearInterval(interval);
  }, [doubleXpActive, setMiningExp]);

  // Level up system
  useEffect(() => {
    if (miningExp >= expToNextLevel) {
      setLevel(prev => prev + 1);
      setMiningExp(prev => prev - expToNextLevel);
      
      // Check for level rewards
      setLevelRewards(prev => prev.map(reward => 
        reward.level === level + 1 ? { ...reward, unlocked: true } : reward
      ));

      toast({
        title: "🎉 Niveau supérieur atteint!",
        description: `Niveau ${level + 1} débloqué! Vérifiez vos récompenses!`,
      });
    }
  }, [miningExp, expToNextLevel, level, setLevel, toast]);

  // Double XP timer
  useEffect(() => {
    if (doubleXpTimer > 0) {
      const timer = setTimeout(() => {
        setDoubleXpTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setDoubleXpActive(false);
    }
  }, [doubleXpTimer]);

  // Check daily bonus availability
  const canClaimDaily = () => {
    if (!lastClaimDate) return true;
    
    const today = new Date().toDateString();
    const lastClaim = new Date(lastClaimDate).toDateString();
    return today !== lastClaim;
  };

  const claimDailyBonus = () => {
    if (!canClaimDaily()) {
      toast({
        title: "Bonus déjà réclamé!",
        description: "Revenez demain pour votre prochain bonus quotidien",
        variant: "destructive"
      });
      return;
    }

    const currentBonus = dailyBonuses[currentStreak - 1];
    if (!currentBonus) return;

    // Calculate rewards
    const baseDeadspot = currentStreak === 1 ? 10 : 
                        currentStreak === 2 ? 15 :
                        currentStreak === 3 ? 25 :
                        currentStreak === 4 ? 40 :
                        currentStreak === 5 ? 60 :
                        currentStreak === 6 ? 100 : 200;

    const baseDiamonds = Math.floor(baseDeadspot / 2);

    setDeadspotCoins(prev => prev + baseDeadspot);
    setDiamonds(prev => prev + baseDiamonds);

    // Update streak
    setCurrentStreak(prev => prev < 7 ? prev + 1 : 1);
    setLastClaimDate(new Date().toISOString());
    setTotalDaysPlayed(prev => prev + 1);

    // Check fidelity bonuses
    setFidelityBonuses(prev => prev.map(bonus => 
      totalDaysPlayed + 1 >= bonus.days ? { ...bonus, unlocked: true } : bonus
    ));

    toast({
      title: "🎁 Bonus quotidien réclamé!",
      description: `+${baseDeadspot} DeadSpot coins et +${baseDiamonds} diamants!`,
    });
  };

  const claimLevelReward = (levelNumber: number) => {
    const reward = levelRewards.find(r => r.level === levelNumber);
    if (!reward || !reward.unlocked || reward.claimed) return;

    if (levelNumber === 5) {
      setDiamonds(prev => prev + 50);
    } else if (levelNumber === 10) {
      setDiamonds(prev => prev + 100);
    } else if (levelNumber === 15) {
      setDiamonds(prev => prev + 200);
      setDoubleXpActive(true);
      setDoubleXpTimer(86400); // 24h in seconds
    } else if (levelNumber === 20) {
      setDiamonds(prev => prev + 500);
    } else if (levelNumber === 25) {
      setDiamonds(prev => prev + 1000);
    } else if (levelNumber === 30) {
      setDiamonds(prev => prev + 2000);
    }

    setLevelRewards(prev => prev.map(r => 
      r.level === levelNumber ? { ...r, claimed: true } : r
    ));

    toast({
      title: "🏆 Récompense de niveau réclamée!",
      description: reward.reward,
    });
  };

  return (
    <div className="space-y-6">
      {/* Mining Experience Progress */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-warning" />
            Expérience de Mining
            {doubleXpActive && (
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                Double XP: {Math.floor(doubleXpTimer / 3600)}h {Math.floor((doubleXpTimer % 3600) / 60)}m
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold">Niveau {level}</span>
            <span className="text-muted-foreground">{miningExp}/{expToNextLevel} EXP</span>
          </div>
          <Progress value={expProgress} className="h-3" />
          <div className="text-sm text-muted-foreground text-center">
            +{doubleXpActive ? '10' : '5'} EXP toutes les 10 secondes
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Daily Bonuses */}
        <Card className="gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-success" />
              Bonus Quotidiens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-success">Jour {currentStreak}/7</div>
              <div className="text-sm text-muted-foreground">Série actuelle</div>
            </div>
            
            <Button
              onClick={claimDailyBonus}
              disabled={!canClaimDaily()}
              className="w-full"
              variant={canClaimDaily() ? "default" : "outline"}
            >
              <Gift className="w-4 h-4 mr-2" />
              {canClaimDaily() ? "Réclamer le bonus du jour" : "Bonus déjà réclamé"}
            </Button>

            <div className="grid grid-cols-7 gap-2">
              {dailyBonuses.map((bonus) => (
                <div
                  key={bonus.day}
                  className={`p-2 rounded-lg text-center text-xs border ${
                    bonus.day <= currentStreak 
                      ? 'bg-success/20 border-success/50' 
                      : 'bg-card/50 border-border/50'
                  }`}
                >
                  <div className="font-medium">J{bonus.day}</div>
                  <div className="text-xs mt-1">x{bonus.multiplier}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Level Rewards */}
        <Card className="gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-warning" />
              Récompenses de Niveau
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-80 overflow-y-auto">
            {levelRewards.map((reward) => (
              <div key={reward.level} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex-1">
                  <div className="font-medium">Niveau {reward.level}</div>
                  <div className="text-sm text-muted-foreground">{reward.reward}</div>
                </div>
                <div className="ml-4">
                  {reward.claimed ? (
                    <Badge variant="outline" className="bg-success/20 text-success">
                      <Award className="w-3 h-3 mr-1" />
                      Réclamé
                    </Badge>
                  ) : reward.unlocked ? (
                    <Button
                      onClick={() => claimLevelReward(reward.level)}
                      size="sm"
                      variant="outline"
                    >
                      Réclamer
                    </Button>
                  ) : (
                    <Badge variant="outline">
                      Niveau {reward.level}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Fidelity Bonuses */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-info" />
            Bonus de Fidélité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-2xl font-bold text-info">{totalDaysPlayed} jours</div>
            <div className="text-sm text-muted-foreground">Total de jours joués</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fidelityBonuses.map((bonus) => (
              <div
                key={bonus.days}
                className={`p-4 rounded-lg border text-center ${
                  bonus.unlocked 
                    ? 'bg-info/20 border-info/50' 
                    : 'bg-card/50 border-border/50'
                }`}
              >
                <div className="text-lg font-bold">{bonus.days} jours</div>
                <div className="text-sm text-muted-foreground mt-2">{bonus.reward}</div>
                {bonus.unlocked ? (
                  <Badge variant="outline" className="mt-3 bg-info/20 text-info">
                    <Star className="w-3 h-3 mr-1" />
                    Débloqué
                  </Badge>
                ) : (
                  <div className="mt-3 text-xs text-muted-foreground">
                    {bonus.days - totalDaysPlayed} jours restants
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RewardsSystem;