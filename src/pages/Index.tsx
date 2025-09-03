

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Activity, 
  Coins, 
  Diamond, 
  Zap, 
  Users, 
  TrendingUp,
  Shield,
  Gamepad2,
  Gift,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMiningPersistence } from "@/hooks/useMiningPersistence";
import { useFarmingData } from "@/hooks/useFarmingData";
import { useAllDataPersistence } from "@/hooks/useAllDataPersistence";

// Components
import MiningSection from "@/components/MiningSection";
import { ClickToEarn } from "@/components/ClickToEarn";
import { SpinWheel } from "@/components/SpinWheel";
import { FaucetClaim } from "@/components/FaucetClaim";
import ReferralSystem from "@/components/ReferralSystem";
import StakingCard from "@/components/StakingCard";
import TonStaking from "@/components/TonStaking";
import CustomStaking from "@/components/CustomStaking";
import { CryptoDepositSystem } from "@/components/CryptoDepositSystem";
import PaymentSection from "@/components/PaymentSection";
import DepositTracker from "@/components/DepositTracker";
import StakingTracker from "@/components/StakingTracker";
import PortfolioTracker from "@/components/PortfolioTracker";
import SecurityCenter from "@/components/SecurityCenter";
import { DataPersistenceDashboard } from "@/components/DataPersistenceDashboard";
import LiveChat from "@/components/LiveChat";
import NewsCenter from "@/components/NewsCenter";
import DeadSpotShop from "@/components/DeadSpotShop";
import VIPSystem from "@/components/VIPSystem";
import BattlePassSystem from "@/components/BattlePassSystem";
import LootBoxSystem from "@/components/LootBoxSystem";
import MissionsSystem from "@/components/MissionsSystem";
import EventsSystem from "@/components/EventsSystem";
import LeaderboardSystem from "@/components/LeaderboardSystem";
import RewardsSystem from "@/components/RewardsSystem";
import { LanguageSelector } from "@/components/LanguageSelector";
import ComingSoonSection from "@/components/ComingSoonSection";

const Index = () => {
  const { user, signOut } = useAuth();
  const { miningData } = useMiningPersistence();
  const { state: farmingState, loading: farmingLoading, savePartial } = useFarmingData();
  const { getUserStats } = useAllDataPersistence();

  const [userStats, setUserStats] = useState<any>(null);

  // Load user stats
  useEffect(() => {
    if (user) {
      getUserStats().then(setUserStats);
    }
  }, [user, getUserStats]);

  // Setters for RewardsSystem (sync with Supabase via useFarmingData)
  const setDeadspotCoins = (value: number | ((prev: number) => number)) => {
    const next = typeof value === 'function' ? (value as (prev: number) => number)(farmingState.deadspotCoins) : value;
    savePartial({ deadspotCoins: next });
  };

  const setDiamonds = (value: number | ((prev: number) => number)) => {
    const next = typeof value === 'function' ? (value as (prev: number) => number)(farmingState.diamonds) : value;
    savePartial({ diamonds: next });
  };

  const setMiningExp = (value: number | ((prev: number) => number)) => {
    const current = farmingState.miningExp;
    const next = typeof value === 'function' ? (value as (prev: number) => number)(current) : value;
    // Persist and keep alias in local state
    savePartial({ miningExperience: next as number, miningExp: next as number });
  };

  const setLevel = (value: number | ((prev: number) => number)) => {
    const current = farmingState.level;
    const next = typeof value === 'function' ? (value as (prev: number) => number)(current) : value;
    // Persist and keep alias in local state
    savePartial({ miningLevel: next as number, level: next as number });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to DeadSpot</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Please sign in to access the platform
            </p>
            <Button 
              onClick={() => window.location.href = '/auth'}
              className="w-full"
              size="lg"
            >
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                DeadSpot Platform
              </h1>
              <Badge variant="secondary" className="animate-pulse">
                Beta
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <div className="hidden md:flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-primary" />
                  <span className="font-mono">
                    {farmingState.deadspotCoins.toFixed(2)} DSC
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Diamond className="w-4 h-4 text-blue-500" />
                  <span className="font-mono">
                    {farmingState.diamonds.toLocaleString()} 💎
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="font-mono">
                    {farmingState.energy}/{farmingState.maxEnergy} ⚡
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <Activity className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-lg font-bold">
                {miningData?.is_currently_mining ? 'Active' : 'Inactive'}
              </div>
              <div className="text-xs text-muted-foreground">Mining Status</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-success" />
              <div className="text-lg font-bold">
                {miningData?.total_blocks_mined || 0}
              </div>
              <div className="text-xs text-muted-foreground">Blocks Mined</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-info" />
              <div className="text-lg font-bold">Lvl {farmingState.level}</div>
              <div className="text-xs text-muted-foreground">Mining Level</div>
            </CardContent>
          </Card>
          
          <Card className="gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <Gift className="w-6 h-6 mx-auto mb-2 text-warning" />
              <div className="text-lg font-bold">
                {userStats?.account_age_days || 0}d
              </div>
              <div className="text-xs text-muted-foreground">Account Age</div>
            </CardContent>
          </Card>
        </section>

        {/* Main Sections */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Mining & Core Features */}
          <div className="xl:col-span-2 space-y-8">
            {/* Mining Section */}
            <section id="mining">
              <MiningSection />
            </section>
            
            <Separator className="my-8" />
            
            {/* Click to Earn */}
            <section id="click-to-earn">
              <ClickToEarn />
            </section>
            
            <Separator className="my-8" />
            
            {/* Spin Wheel */}
            <section id="spin-wheel">
              <SpinWheel />
            </section>
          </div>
          
          {/* Right Column - Additional Features */}
          <div className="space-y-8">
            {/* Faucet */}
            <section id="faucet">
              <FaucetClaim />
            </section>
            
            {/* Referral System */}
            <section id="referral">
              <ReferralSystem />
            </section>
            
            {/* Staking */}
            <section id="staking" className="space-y-6">
              <StakingCard 
                name="Bitcoin"
                symbol="BTC"
                network="Bitcoin Network"
                apy="5.2"
                icon="₿"
                color="bg-orange-500"
                walletAddress="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
              />
              <TonStaking />
              <CustomStaking />
            </section>
          </div>
        </div>
        
        <Separator className="my-12" />
        
        {/* Full Width Sections */}
        <div className="space-y-12">
          {/* Financial Services */}
          <section id="financial-services">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CryptoDepositSystem />
              <PaymentSection />
            </div>
          </section>
          
          {/* Tracking & Analytics */}
          <section id="tracking" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DepositTracker />
              <StakingTracker />
              <PortfolioTracker />
            </div>
          </section>
          
          {/* Platform Features */}
          <section id="platform-features">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SecurityCenter />
              <DataPersistenceDashboard />
            </div>
          </section>
          
          {/* Social & Communication */}
          <section id="social">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <LiveChat />
              <NewsCenter />
            </div>
          </section>
          
          {/* Shop & Gaming */}
          <section id="gaming" className="space-y-8">
            <DeadSpotShop />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <VIPSystem />
              <BattlePassSystem />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <LootBoxSystem />
              <MissionsSystem />
              <EventsSystem />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <LeaderboardSystem />
              <RewardsSystem 
                deadspotCoins={farmingState.deadspotCoins}
                setDeadspotCoins={setDeadspotCoins}
                diamonds={farmingState.diamonds}
                setDiamonds={setDiamonds}
                miningExp={farmingState.miningExp}
                setMiningExp={setMiningExp}
                level={farmingState.level}
                setLevel={setLevel}
              />
            </div>
          </section>

          {/* Coming Soon Section */}
          <section id="coming-soon" className="py-12">
            <div className="container mx-auto">
              <ComingSoonSection />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;

