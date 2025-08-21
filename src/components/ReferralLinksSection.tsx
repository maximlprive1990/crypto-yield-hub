import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Gamepad2, Pickaxe, Droplets, Mouse, FileText } from "lucide-react";

interface ReferralLink {
  id: string;
  name: string;
  url: string;
  category: 'website' | 'gaming' | 'mining' | 'faucet' | 'ptc' | 'ads';
  description: string;
  bonus?: string;
  icon: React.ReactNode;
}

const referralLinks: ReferralLink[] = [
  // Website
  {
    id: 'crypto-stake',
    name: 'CryptoStake Pro',
    url: 'https://cryptostake.pro/ref/user123',
    category: 'website',
    description: 'Plateforme de staking premium',
    bonus: '10% bonus',
    icon: <Globe className="w-5 h-5" />
  },
  
  // Gaming
  {
    id: 'crypto-game',
    name: 'CryptoGame Arena',
    url: 'https://cryptogame.arena/ref/user123',
    category: 'gaming',
    description: 'Jeux P2E avec récompenses crypto',
    bonus: '5 ZERO gratuits',
    icon: <Gamepad2 className="w-5 h-5" />
  },
  
  // Mining
  {
    id: 'hash-power',
    name: 'HashPower Mining',
    url: 'https://hashpower.mining/ref/user123',
    category: 'mining',
    description: 'Cloud mining rentable',
    bonus: '10 GH/s gratuits',
    icon: <Pickaxe className="w-5 h-5" />
  },
  
  // Faucet
  {
    id: 'zero-faucet',
    name: 'ZERO Faucet Pro',
    url: 'https://zerofaucet.pro/ref/user123',
    category: 'faucet',
    description: 'Faucet ZERO à haut rendement',
    bonus: '100 ZERO bonus',
    icon: <Droplets className="w-5 h-5" />
  },
  
  // PTC
  {
    id: 'crypto-ptc',
    name: 'CryptoPTC Elite',
    url: 'https://cryptoptc.elite/ref/user123',
    category: 'ptc',
    description: 'Cliquez et gagnez des cryptos',
    bonus: '1000 clics gratuits',
    icon: <Mouse className="w-5 h-5" />
  },
  
  // Ads
  {
    id: 'crypto-ads',
    name: 'CryptoAds Network',
    url: 'https://cryptoads.network/ref/user123',
    category: 'ads',
    description: 'Regardez des pubs, gagnez des cryptos',
    bonus: '50 vues gratuites',
    icon: <FileText className="w-5 h-5" />
  }
];

const categoryColors = {
  website: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  gaming: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  mining: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  faucet: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  ptc: 'bg-green-500/20 text-green-300 border-green-500/30',
  ads: 'bg-red-500/20 text-red-300 border-red-500/30'
};

const categoryLabels = {
  website: 'Site Web',
  gaming: 'Gaming',
  mining: 'Mining',
  faucet: 'Faucet',
  ptc: 'PTC',
  ads: 'Publicités'
};

export const ReferralLinksSection = () => {
  const handleLinkClick = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    console.log(`Opened referral link: ${name}`);
  };

  const groupedLinks = referralLinks.reduce((groups, link) => {
    if (!groups[link.category]) {
      groups[link.category] = [];
    }
    groups[link.category].push(link);
    return groups;
  }, {} as Record<string, ReferralLink[]>);

  return (
    <section className="py-12 bg-secondary/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            🔗 Liens Référrals Premium
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez nos partenaires de confiance et gagnez des bonus exclusifs avec nos liens référrals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(groupedLinks).map(([category, links]) => (
            <Card key={category} className="bg-card/50 border-primary/20 hover:shadow-glow transition-all">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Badge className={categoryColors[category as keyof typeof categoryColors]}>
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {link.icon}
                        <h4 className="font-semibold text-sm">{link.name}</h4>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => handleLinkClick(link.url, link.name)}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {link.description}
                    </p>
                    
                    {link.bonus && (
                      <Badge variant="secondary" className="text-xs">
                        🎁 {link.bonus}
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2 text-xs"
                      onClick={() => handleLinkClick(link.url, link.name)}
                    >
                      Accéder au lien
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Conseil:</strong> Utilisez nos liens référrals pour obtenir des bonus exclusifs et soutenir notre plateforme
          </p>
        </div>
      </div>
    </section>
  );
};