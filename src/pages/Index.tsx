
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "@/components/StatsCard";
import TonStaking from "@/components/TonStaking";
import { Navigate } from "react-router-dom";
import MiningSection from "@/components/MiningSection";
import { ClickToEarn } from "@/components/ClickToEarn";
import { SpinWheel } from "@/components/SpinWheel";
import { RPGGame } from "@/components/RPGGame";
import MiningFarm from "@/components/MiningFarm";
import VIPSystem from "@/components/VIPSystem";
import RewardsSystem from "@/components/RewardsSystem";
import ReferralSystem from "@/components/ReferralSystem";
import SecurityCenter from "@/components/SecurityCenter";
import NewsCenter from "@/components/NewsCenter";
import CustomStaking from "@/components/CustomStaking";
import PortfolioTracker from "@/components/PortfolioTracker";
import LeaderboardSystem from "@/components/LeaderboardSystem";
import CustomizationSystem from "@/components/CustomizationSystem";
import ComingSoonSection from "@/components/ComingSoonSection";
import ClickerGame from "@/components/ClickerGame";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useFarmingData } from "@/hooks/useFarmingData";

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { state: farmingState } = useFarmingData();
  const [showRPG, setShowRPG] = useState(false);

  // State for gaming components
  const [deadspotCoins, setDeadspotCoins] = useState(farmingState.deadspotCoins);
  const [diamonds, setDiamonds] = useState(farmingState.diamonds);
  const [miningExp, setMiningExp] = useState(farmingState.miningExp);
  const [level, setLevel] = useState(farmingState.level);

  // Sync with farming data
  useEffect(() => {
    setDeadspotCoins(farmingState.deadspotCoins);
    setDiamonds(farmingState.diamonds);
    setMiningExp(farmingState.miningExp);
    setLevel(farmingState.level);
  }, [farmingState]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  if (showRPG) {
    return <RPGGame onClose={() => setShowRPG(false)} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background/95 to-primary/5">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header with logout button */}
          <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="container mx-auto flex justify-between items-center py-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold gradient-text">CryptoStake Pro</h1>
              <Button variant="outline" onClick={handleSignOut}>
                Déconnexion
              </Button>
            </div>
          </header>

          {/* Hero Section */}
          <section id="features" className="bg-primary/10 py-16">
            <div className="container mx-auto text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">
                Bienvenue{user ? `, ${user.email}!` : "!"}
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Plateforme de staking et de minage décentralisée
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" className="animate-pulse">
                  Commencer
                </Button>
                <Button variant="outline" size="lg">
                  En savoir plus
                </Button>
              </div>
            </div>
          </section>

          {/* Stats Overview */}
          <section className="py-12">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  icon="⛏️"
                  title="Mining Power"
                  value="1.2K TH/s"
                  color="bg-primary/10"
                />
                <StatsCard
                  icon="💰"
                  title="Total Earned"
                  value="$2,450"
                  color="bg-success/10"
                />
                <StatsCard
                  icon="📈"
                  title="Efficiency"
                  value="94.5%"
                  color="bg-warning/10"
                />
                <StatsCard
                  icon="🎯"
                  title="Active Users"
                  value="15.2K"
                  color="bg-info/10"
                />
              </div>
            </div>
          </section>

          {/* Gaming Section */}
          <section id="gaming" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🎮 Gaming Features</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <ClickToEarn />
                </div>
                <div>
                  <SpinWheel />
                </div>
              </div>
              <div className="mt-8">
                <Button 
                  onClick={() => setShowRPG(true)}
                  size="lg"
                  className="w-full h-20 text-xl"
                >
                  🏰 Lancer le Jeu RPG
                </Button>
              </div>
            </div>
          </section>

          {/* Clicker Game Section */}
          <section id="clicker" className="py-12">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🎯 Clicker Game</h2>
              <ClickerGame />
            </div>
          </section>

          {/* Mining Control Section */}
          <section id="mining-control" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">⚙️ Contrôle Mineur</h2>
              <MiningSection />
            </div>
          </section>

          {/* Deposits & Staking Section */}
          <section id="deposits" className="py-12">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">💎 Dépôts & Staking</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TonStaking />
                <CustomStaking />
              </div>
            </div>
          </section>

          {/* Mining Farm Section */}
          <section id="mining-farm" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">⛏️ Ferme Mining</h2>
              <MiningFarm />
            </div>
          </section>

          {/* Rewards System */}
          <section id="rewards" className="py-12">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🎁 Récompenses</h2>
              <RewardsSystem />
            </div>
          </section>

          {/* VIP & Monetization */}
          <section id="vip" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">👑 VIP & Monétisation</h2>
              <VIPSystem />
            </div>
          </section>

          {/* Referral System */}
          <section id="referrals" className="py-12">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🔗 Système Parrainage</h2>
              <ReferralSystem />
            </div>
          </section>

          {/* Leaderboard */}
          <section id="leaderboard" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🏆 Classements</h2>
              <LeaderboardSystem />
            </div>
          </section>

          {/* Portfolio Tracker */}
          <section id="portfolio" className="py-12">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">📊 Portfolio</h2>
              <PortfolioTracker />
            </div>
          </section>

          {/* Customization */}
          <section id="customization" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🎨 Personnalisation</h2>
              <CustomizationSystem />
            </div>
          </section>

          {/* Security Center */}
          <section id="security" className="py-12">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">🛡️ Sécurité</h2>
              <SecurityCenter />
            </div>
          </section>

          {/* News Center */}
          <section id="news" className="py-12 bg-muted/20">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8 gradient-text">📰 Actualités</h2>
              <NewsCenter />
            </div>
          </section>

          {/* Coming Soon Section - Une seule section principale */}
          <section id="coming-soon" className="py-12">
            <div className="container mx-auto">
              <ComingSoonSection />
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-muted/50 py-12 border-t">
            <div className="container mx-auto text-center">
              <h3 className="text-2xl font-bold gradient-text mb-4">CryptoStake Pro</h3>
              <p className="text-muted-foreground mb-4">
                La plateforme de staking et mining la plus complète
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="sm">Documentation</Button>
                <Button variant="outline" size="sm">Support</Button>
                <Button variant="outline" size="sm">API</Button>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
