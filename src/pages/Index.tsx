import StakingCard from "@/components/StakingCard";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import heroBackground from "@/assets/hero-background.jpg";

const Index = () => {
  const stakingPools = [
    {
      name: "Polygon",
      symbol: "MATIC",
      network: "Polygon Network",
      apy: "7",
      icon: "🔷",
      color: "bg-purple-600"
    },
    {
      name: "Bitcoin",
      symbol: "BTC",
      network: "Bitcoin Network",
      apy: "5",
      icon: "₿",
      color: "bg-orange-500"
    },
    {
      name: "TRON",
      symbol: "TRX",
      network: "TRC20",
      apy: "6",
      icon: "🔺",
      color: "bg-red-500"
    },
    {
      name: "Toncoin",
      symbol: "TON",
      network: "TON Network",
      apy: "4",
      icon: "💎",
      color: "bg-blue-500"
    },
    {
      name: "Solana",
      symbol: "SOL",
      network: "Solana Network",
      apy: "3",
      icon: "☀️",
      color: "bg-purple-400"
    },
    {
      name: "Dogecoin",
      symbol: "DOGE",
      network: "Dogecoin Network",
      apy: "1",
      icon: "🐕",
      color: "bg-yellow-500"
    }
  ];

  const stats = [
    {
      title: "Total Value Locked",
      value: "$2.4B",
      icon: "💰",
      color: "bg-green-500"
    },
    {
      title: "Active Stakers",
      value: "150K+",
      icon: "👥",
      color: "bg-blue-500"
    },
    {
      title: "Récompenses Distribuées",
      value: "$45M",
      icon: "🎁",
      color: "bg-purple-500"
    },
    {
      title: "Cryptos Supportées",
      value: "6",
      icon: "🪙",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
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
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Statistiques de la Plateforme
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Staking Pools Section */}
      <section className="py-20 px-6 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pools de Staking Disponibles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choisissez parmi nos pools de staking optimisés pour maximiser vos rendements quotidiens
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stakingPools.map((pool, index) => (
              <StakingCard key={index} {...pool} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Pourquoi Choisir CryptoStake Pro ?
          </h2>
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