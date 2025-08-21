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
  // Gaming
  {
    id: 'talemar',
    name: 'Talemar',
    url: 'https://talemar.com/?ref=2316',
    category: 'gaming',
    description: 'Jeu crypto avec récompenses',
    bonus: 'Bonus de parrainage',
    icon: <Gamepad2 className="w-5 h-5" />
  },
  {
    id: 'crypto-marvel',
    name: 'Crypto Marvel Game',
    url: 'https://crypto-marvelgame.net/?ref=Maximlprive90',
    category: 'gaming',
    description: 'Jeu Marvel avec crypto rewards',
    bonus: 'Héros gratuit',
    icon: <Gamepad2 className="w-5 h-5" />
  },
  {
    id: 'blocklooter',
    name: 'BlockLooter',
    url: 'https://blocklooter.com/?r=8778',
    category: 'gaming',
    description: 'Jeu de collection blockchain',
    bonus: 'Pack de démarrage',
    icon: <Gamepad2 className="w-5 h-5" />
  },
  {
    id: 'rollercoin',
    name: 'RollerCoin',
    url: 'https://rollercoin.com/?r=k1xc8514',
    category: 'gaming',
    description: 'Simulateur de mining avec jeux',
    bonus: '1000 satoshi',
    icon: <Gamepad2 className="w-5 h-5" />
  },
  
  // Mining
  {
    id: 'chainers',
    name: 'Chainers.io',
    url: 'https://chainers.io/?r=lzt79xqp',
    category: 'mining',
    description: 'Plateforme de mining avancée',
    bonus: 'Bonus hashrate',
    icon: <Pickaxe className="w-5 h-5" />
  },
  {
    id: 'hashup',
    name: 'HashUp',
    url: 'https://hashup.cc/?ref=695',
    category: 'mining',
    description: 'Cloud mining professionnel',
    bonus: 'GH/s gratuits',
    icon: <Pickaxe className="w-5 h-5" />
  },
  {
    id: 'eonmining',
    name: 'EonMining',
    url: 'https://eonmining.site/?ref=maximlprive90',
    category: 'mining',
    description: 'Mining site rentable',
    bonus: 'Boost mining',
    icon: <Pickaxe className="w-5 h-5" />
  },
  {
    id: 'ltcunit',
    name: 'LTC Unit',
    url: 'https://ltcunit.com/?ref=maximlprive90',
    category: 'mining',
    description: 'Mining Litecoin optimisé',
    bonus: 'LTC bonus',
    icon: <Pickaxe className="w-5 h-5" />
  },
  {
    id: 'ltcminer',
    name: 'LTC Miner',
    url: 'https://ltcminer.com/843600',
    category: 'mining',
    description: 'Miner LTC automatique',
    bonus: 'Auto-mining',
    icon: <Pickaxe className="w-5 h-5" />
  },
  {
    id: 'contract-miner',
    name: 'Contract Miner',
    url: 'https://www.contract-miner.com/?ref_user=botbitcoin90',
    category: 'mining',
    description: 'Contrats de mining flexibles',
    bonus: 'Contrat gratuit',
    icon: <Pickaxe className="w-5 h-5" />
  },
  {
    id: 'miningblocks',
    name: 'Mining Blocks Club',
    url: 'https://miningblocks.club/?Referral=178',
    category: 'mining',
    description: 'Club de mining communautaire',
    bonus: 'Adhésion VIP',
    icon: <Pickaxe className="w-5 h-5" />
  },
  
  // Faucets
  {
    id: 'camelbtc',
    name: 'CamelBTC',
    url: 'https://camelbtc.com/?ref=17311',
    category: 'faucet',
    description: 'Faucet BTC premium',
    bonus: '100 satoshi',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'litepick',
    name: 'LitePick',
    url: 'https://litepick.io/?ref=maximlprive90',
    category: 'faucet',
    description: 'Faucet multicrypto léger',
    bonus: 'Claims bonus',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'polpick',
    name: 'PolPick',
    url: 'https://polpick.io/?ref=maximlprive90',
    category: 'faucet',
    description: 'Faucet Polygon optimisé',
    bonus: 'MATIC gratuits',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'usdpick',
    name: 'USDPick',
    url: 'https://usdpick.io?ref=LyRyocsNSP',
    category: 'faucet',
    description: 'Faucet USDT/USDC',
    bonus: 'Stablecoins',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freetrump',
    name: 'FreeTrump',
    url: 'https://freetrump.in?ref=zT2xHibf2A',
    category: 'faucet',
    description: 'Faucet Trump coin',
    bonus: 'TRUMP tokens',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freetron',
    name: 'FreeTron',
    url: 'https://freetron.in?ref=FOfCEENdrI',
    category: 'faucet',
    description: 'Faucet TRON gratuit',
    bonus: 'TRX rewards',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freexrp',
    name: 'FreeXRP',
    url: 'https://freexrp.in?ref=tIxdOiQy-v',
    category: 'faucet',
    description: 'Faucet XRP premium',
    bonus: 'XRP drops',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freesui',
    name: 'FreeSUI',
    url: 'https://freesui.in?ref=pRk169puly',
    category: 'faucet',
    description: 'Faucet SUI blockchain',
    bonus: 'SUI tokens',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freeshib',
    name: 'FreeShib',
    url: 'https://freeshib.in?ref=KjBkG02sas',
    category: 'faucet',
    description: 'Faucet Shiba Inu',
    bonus: 'SHIB rewards',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freebnb',
    name: 'FreeBNB',
    url: 'https://freebnb.in?ref=3qTZUmhIIP',
    category: 'faucet',
    description: 'Faucet Binance Coin',
    bonus: 'BNB bonus',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'freetoncoin',
    name: 'FreeToncoin',
    url: 'https://freetoncoin.in?ref=7GXtPDm6Bz',
    category: 'faucet',
    description: 'Faucet TON Network',
    bonus: 'TON rewards',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'megaco',
    name: 'MegaCo',
    url: 'https://megaco.in/?r=f12980ca',
    category: 'faucet',
    description: 'Mega faucet multicrypto',
    bonus: 'Mega bonus',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'cryptodrip',
    name: 'CryptoDrip',
    url: 'https://cryptodrip.io/index.php?ref=128339',
    category: 'faucet',
    description: 'Faucet drip system',
    bonus: 'Drip rewards',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'viefaucet',
    name: 'VieFaucet',
    url: 'https://viefaucet.com?r=64c866f539d82707177b242c',
    category: 'faucet',
    description: 'Faucet vie premium',
    bonus: 'Vie tokens',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'donaldco',
    name: 'DonaldCo',
    url: 'https://donaldco.in/index.php?ref=maximlprive90',
    category: 'faucet',
    description: 'Faucet Donald themed',
    bonus: 'Donald coins',
    icon: <Droplets className="w-5 h-5" />
  },
  {
    id: 'cashupcoin',
    name: 'CashUpCoin',
    url: 'https://cashupcoin.com/ref/id/maximlprive90',
    category: 'faucet',
    description: 'Faucet cash up system',
    bonus: 'Cash rewards',
    icon: <Droplets className="w-5 h-5" />
  },

  // PTC (Pay to Click)
  {
    id: 'pigzer',
    name: 'Pigzer',
    url: 'https://pigzer.eu/?ref=248',
    category: 'ptc',
    description: 'PTC européen premium',
    bonus: '1000 clics',
    icon: <Mouse className="w-5 h-5" />
  },
  {
    id: 'exclick',
    name: 'ExClick Pro',
    url: 'https://exclick.pro/?r=718290',
    category: 'ptc',
    description: 'PTC professionnel',
    bonus: 'Clics premium',
    icon: <Mouse className="w-5 h-5" />
  },

  // Ads
  {
    id: 'teaserfast-a',
    name: 'TeaserFast (Annonceur)',
    url: 'https://teaserfast.ru/a/maximlprive90',
    category: 'ads',
    description: 'Plateforme publicitaire',
    bonus: 'Crédit pub',
    icon: <FileText className="w-5 h-5" />
  },
  {
    id: 'teaserfast-u',
    name: 'TeaserFast (Utilisateur)',
    url: 'https://teaserfast.ru/u/maximlprive90',
    category: 'ads',
    description: 'Regarder des pubs payantes',
    bonus: 'Vues bonus',
    icon: <FileText className="w-5 h-5" />
  },

  // Website/Services
  {
    id: 'lovable',
    name: 'Lovable Dev',
    url: 'https://lovable.dev/invite/4db65234-00e6-4c8a-aff5-a8f7d4028df4',
    category: 'website',
    description: 'Plateforme de développement',
    bonus: 'Accès premium',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'faucetpay',
    name: 'FaucetPay',
    url: 'https://faucetpay.io/?r=492929',
    category: 'website',
    description: 'Portefeuille micro-paiements',
    bonus: 'Frais réduits',
    icon: <Globe className="w-5 h-5" />
  },
  {
    id: 'payeer',
    name: 'Payeer',
    url: 'https://payeer.com/033816044',
    category: 'website',
    description: 'Portefeuille électronique',
    bonus: 'Bonus inscription',
    icon: <Globe className="w-5 h-5" />
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