
import StakingCard from "@/components/StakingCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import heroBackground from "@/assets/hero-background.jpg";
import { useState } from "react";
import { FaucetClaim } from "@/components/FaucetClaim";
import { SpinWheel } from "@/components/SpinWheel";

/* Sections & systèmes (réintégration) */
import PlatformStats from "@/components/PlatformStats";
import StakingTracker from "@/components/StakingTracker";
import CryptoDepositSystem from "@/components/CryptoDepositSystem";
import DepositTracker from "@/components/DepositTracker";
import PaymentSection from "@/components/PaymentSection";
import ClickerGame from "@/components/ClickerGame";
import ClickToEarn from "@/components/ClickToEarn";
import MiningFarm from "@/components/MiningFarm";
import RewardsSystem from "@/components/RewardsSystem";
import DeadSpotShop from "@/components/DeadSpotShop";
import ReferralLinksSection from "@/components/ReferralLinksSection";
import ReferralSystem from "@/components/ReferralSystem";
import VIPSystem from "@/components/VIPSystem";
import LootBoxSystem from "@/components/LootBoxSystem";
import BattlePassSystem from "@/components/BattlePassSystem";
import MissionsSystem from "@/components/MissionsSystem";
import EventsSystem from "@/components/EventsSystem";
import LeaderboardSystem from "@/components/LeaderboardSystem";
import CustomizationSystem from "@/components/CustomizationSystem";
import SecurityCenter from "@/components/SecurityCenter";
import NewsCenter from "@/components/NewsCenter";
import PortfolioTracker from "@/components/PortfolioTracker";
import { HashrateTicker } from "@/components/HashrateTicker";
import ZeroWallet from "@/components/rpg/ZeroWallet";

/* NOTE: Les imports ci-dessus existent déjà dans le projet (liste en lecture seule). */

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { t } = useLanguage();
  
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);

  const handleZeroWin = (amount: number) => {
    console.log('Zero win:', amount);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const stakingPools = [
    {
      name: "Polygon",
      symbol: "MATIC",
      network: "Polygon Network",
      apy: "7",
      icon: "🔷",
      color: "bg-purple-600",
      walletAddress: "0x380060e81A820a1691fA58C84ba27c23ed1Eff77"
    },
    {
      name: "Bitcoin",
      symbol: "BTC",
      network: "Bitcoin Network",
      apy: "5",
      icon: "₿",
      color: "bg-orange-500",
      walletAddress: "1LJWeugswr2GsqAZ7H8pFYZ7Q2uF8pAVb8"
    },
    {
      name: "TRON",
      symbol: "TRX",
      network: "TRC20",
      apy: "6",
      icon: "🔺",
      color: "bg-red-500",
      walletAddress: "TY4o9UKBz32xi8hexbv6XhccqGBqSk8oJ7"
    },
    {
      name: "Toncoin",
      symbol: "TON",
      network: "TON Network",
      apy: "4",
      icon: "💎",
      color: "bg-blue-500",
      walletAddress: "EQD14kgmngE0fNYVs7_9dw78V3rPhNt7_Ee-7X3ykDORQvMp",
      memo: "492929"
    },
    {
      name: "Solana",
      symbol: "SOL",
      network: "Solana Network",
      apy: "3",
      icon: "☀️",
      color: "bg-purple-400",
      walletAddress: "CWnduVqeRQrxqhGPNDnHTqHWM1dJLqCnojhMQS8FEUFB"
    },
    {
      name: "Dogecoin",
      symbol: "DOGE",
      network: "Dogecoin Network",
      apy: "1",
      icon: "🐕",
      color: "bg-yellow-500",
      walletAddress: "DDVYeK8MiizfsnzLtigSAWfx6PH24puQze"
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1">
          {/* Language Selector - Fixed position */}
          <div className="fixed top-4 right-4 z-50">
            <LanguageSelector />
          </div>
      
          {/* Spin Wheel Slide */}
          {showSpinWheel && (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
              <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold gradient-text">🎰 {t('gaming.spin.title')}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSpinWheel(false)}
                    className="text-2xl"
                  >
                    {t('close')}
                  </Button>
                </div>
                <SpinWheel onZeroWin={handleZeroWin} />
              </div>
            </div>
          )}

          {/* Faucet ZERO Slide */}
          {showFaucet && (
            <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
              <div className="container mx-auto p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold gradient-text">💧 {t('gaming.faucet.title')}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowFaucet(false)}
                    className="text-2xl"
                  >
                    {t('close')}
                  </Button>
                </div>
                <FaucetClaim 
                  onOpenSpin={() => setShowSpinWheel(true)}
                />
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${heroBackground})` }}
            />
            <div className="absolute inset-0 bg-background/80" />
            
            <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-crypto bg-clip-text text-transparent animate-float">
                {t('app.title')}
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('app.subtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="crypto" size="xl" className="shadow-glow">
                  {t('hero.start_staking')}
                </Button>
                <Button variant="ghost" size="sm" onClick={signOut} className="mt-4">
                  {t('sign_out')}
                </Button>
              </div>
            </div>
          </section>

          {/* FEATURES */}
          <section id="features" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Avantages</h2>
              <p className="text-muted-foreground">Aperçu des chiffres clés</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <PlatformStats />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <StakingTracker />
              </div>
            </div>
          </section>

          {/* GAMING */}
          <section id="gaming" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('gaming.title')}</h2>
              <p className="text-muted-foreground">{t('gaming.subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-card rounded-lg border border-primary/20 hover:shadow-glow transition-all">
                <div className="text-4xl mb-4">💧</div>
                <h3 className="text-lg font-bold mb-2">{t('gaming.faucet.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('gaming.faucet.description')}
                </p>
                <Button 
                  variant="secondary" 
                  onClick={() => setShowFaucet(true)}
                  className="w-full shadow-glow"
                >
                  {t('gaming.faucet.claim')}
                </Button>
              </div>
              
              <div className="text-center p-6 bg-card rounded-lg border border-primary/20 hover:shadow-glow transition-all">
                <div className="text-4xl mb-4">🎰</div>
                <h3 className="text-lg font-bold mb-2">{t('gaming.spin.title')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('gaming.spin.description')}
                </p>
                <Button 
                  variant="crypto" 
                  onClick={() => setShowSpinWheel(true)}
                  className="w-full shadow-glow"
                >
                  {t('gaming.spin.turn')}
                </Button>
              </div>
            </div>
          </section>

          {/* MINING CONTROL */}
          <section id="mining-control" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Contrôle du Mineur</h2>
              <p className="text-muted-foreground">Suivi de votre hashrate</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <HashrateTicker />
            </div>
          </section>

          {/* STATS */}
          <section id="stats" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Statistiques</h2>
              <p className="text-muted-foreground">Résumé de la plateforme</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <PlatformStats />
            </div>
          </section>

          {/* DEPOSITS */}
          <section id="deposits" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Dépôts & Paiements</h2>
              <p className="text-muted-foreground">Déposer des cryptos et suivre vos dépôts</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <CryptoDepositSystem />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <DepositTracker />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4 lg:col-span-2">
                <PaymentSection />
              </div>
            </div>
          </section>

          {/* CLICKER */}
          <section id="clicker" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">DeadSpot Click</h2>
              <p className="text-muted-foreground">Cliquez pour gagner et montez en niveau</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <ClickerGame />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <ClickToEarn />
              </div>
            </div>
          </section>

          {/* MINING FARM */}
          <section id="mining-farm" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Ferme de Mining</h2>
              <p className="text-muted-foreground">Gérez votre ferme et optimisez vos gains</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <MiningFarm />
            </div>
          </section>

          {/* REWARDS */}
          <section id="rewards" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Récompenses</h2>
              <p className="text-muted-foreground">Gagnez et dépensez vos DeadSpot</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <RewardsSystem />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <DeadSpotShop />
              </div>
            </div>
          </section>

          {/* REFERRALS */}
          <section id="referrals" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Liens Référents</h2>
              <p className="text-muted-foreground">Partagez et gagnez avec vos amis</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <ReferralLinksSection />
            </div>
          </section>

          {/* VIP */}
          <section id="vip" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">VIP & Monétisation</h2>
              <p className="text-muted-foreground">Débloquez des bonus exclusifs</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <VIPSystem />
            </div>
          </section>

          {/* GAMING FEATURES */}
          <section id="gaming-features" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Gaming Features</h2>
              <p className="text-muted-foreground">Loot boxes, missions, événements, et plus</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <LootBoxSystem />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <BattlePassSystem />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <MissionsSystem />
              </div>
              <div className="bg-card rounded-lg border border-primary/20 p-4">
                <EventsSystem />
              </div>
            </div>
          </section>

          {/* LEADERBOARD */}
          <section id="leaderboard" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Classements</h2>
              <p className="text-muted-foreground">Mesurez-vous aux autres</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <LeaderboardSystem />
            </div>
          </section>

          {/* CUSTOMIZATION */}
          <section id="customization" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Personnalisation</h2>
              <p className="text-muted-foreground">Skins et personnalisations</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <CustomizationSystem />
            </div>
          </section>

          {/* SECURITY */}
          <section id="security" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Sécurité</h2>
              <p className="text-muted-foreground">Protégez votre compte</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <SecurityCenter />
            </div>
          </section>

          {/* NEWS */}
          <section id="news" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Actualités</h2>
              <p className="text-muted-foreground">Restez informé des nouveautés</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <NewsCenter />
            </div>
          </section>

          {/* CUSTOM STAKING */}
          <section id="custom-staking" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Staking Custom</h2>
              <p className="text-muted-foreground">Construisez vos propres pools</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <CustomStaking />
            </div>
          </section>

          {/* WITHDRAWAL */}
          <section id="withdrawal" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Retrait ZERO</h2>
              <p className="text-muted-foreground">Gérez vos retraits et votre wallet</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <ZeroWallet />
            </div>
          </section>

          {/* PORTFOLIO */}
          <section id="portfolio" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Portfolio</h2>
              <p className="text-muted-foreground">Suivi de vos actifs</p>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <PortfolioTracker />
            </div>
          </section>

          {/* REFERRAL SYSTEM */}
          <section id="referral-system" className="container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Système de Parrainage</h2>
            </div>
            <div className="bg-card rounded-lg border border-primary/20 p-4">
              <ReferralSystem />
            </div>
          </section>

          {/* Staking Pools Section */}
          <section className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pools de Staking Disponibles</h2>
              <p className="text-muted-foreground">Choisissez parmi nos pools optimisés</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stakingPools.map((pool, index) => (
                <StakingCard key={index} {...pool} />
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-card border-t border-primary/20 py-12 px-6">
            <div className="max-w-7xl mx-auto text-center">
              <h3 className="text-2xl font-bold gradient-crypto bg-clip-text text-transparent mb-4">
                CryptoStake Pro
              </h3>
              <p className="text-muted-foreground mb-6">
                La plateforme de staking nouvelle génération
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="ghost" size="sm">Conditions</Button>
                <Button variant="ghost" size="sm">Confidentialité</Button>
                <Button variant="ghost" size="sm">Support</Button>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
