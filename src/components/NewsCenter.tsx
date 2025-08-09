import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, ExternalLink, Clock, Star } from 'lucide-react';
import { useState } from 'react';

const NewsCenter = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const cryptoNews = [
    {
      id: 1,
      title: "Bitcoin atteint un nouveau record historique",
      summary: "Le BTC franchit la barre des 75 000$ grâce à l'adoption institutionnelle croissante...",
      category: "Bitcoin",
      time: "Il y a 2 heures",
      trend: "up",
      impact: "high",
      source: "CoinDesk"
    },
    {
      id: 2,
      title: "Ethereum prépare sa mise à jour Dencun",
      summary: "La nouvelle mise à jour pourrait réduire significativement les frais de transaction...",
      category: "Ethereum",
      time: "Il y a 4 heures",
      trend: "up",
      impact: "medium",
      source: "CryptoNews"
    },
    {
      id: 3,
      title: "Régulation crypto : nouvelles directives européennes",
      summary: "L'UE annonce un cadre réglementaire plus clair pour les cryptomonnaies...",
      category: "Régulation",
      time: "Il y a 6 heures",
      trend: "neutral",
      impact: "high",
      source: "Reuters"
    },
    {
      id: 4,
      title: "Solana : nouveau partenariat avec une banque majeure",
      summary: "SOL gagne en adoption avec l'intégration dans les services bancaires traditionnels...",
      category: "Altcoins",
      time: "Il y a 8 heures",
      trend: "up",
      impact: "medium",
      source: "Cointelegraph"
    },
    {
      id: 5,
      title: "Marché DeFi : TVL en hausse de 15% cette semaine",
      summary: "La finance décentralisée continue sa croissance avec de nouveaux protocoles...",
      category: "DeFi",
      time: "Il y a 12 heures",
      trend: "up",
      impact: "medium",
      source: "DeFi Pulse"
    }
  ];

  const marketAnalysis = [
    {
      crypto: "Bitcoin",
      symbol: "BTC",
      price: 74250,
      change: 3.45,
      analysis: "Tendance haussière forte avec support solide à 72k$",
      recommendation: "Achat",
      color: "bg-orange-500"
    },
    {
      crypto: "Ethereum", 
      symbol: "ETH",
      price: 2850,
      change: 2.15,
      analysis: "Momentum positif avant la mise à jour Dencun",
      recommendation: "Achat",
      color: "bg-blue-500"
    },
    {
      crypto: "Polygon",
      symbol: "MATIC",
      price: 0.89,
      change: 5.67,
      analysis: "Forte adoption et partenariats récents",
      recommendation: "Achat",
      color: "bg-purple-500"
    },
    {
      crypto: "Solana",
      symbol: "SOL",
      price: 145,
      change: -1.23,
      analysis: "Correction technique saine après rallye",
      recommendation: "Attendre",
      color: "bg-purple-400"
    }
  ];

  const categories = [
    { id: 'all', name: 'Toutes' },
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'altcoins', name: 'Altcoins' },
    { id: 'defi', name: 'DeFi' },
    { id: 'regulation', name: 'Régulation' }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Centre d'Actualités Crypto
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Restez informé des dernières actualités et analyses du marché crypto
          </p>
        </div>

        <Tabs defaultValue="news" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news">Actualités</TabsTrigger>
            <TabsTrigger value="analysis">Analyses</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cryptoNews.map((news) => (
                <Card key={news.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg leading-tight">
                        {news.title}
                      </CardTitle>
                      {getTrendIcon(news.trend)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getImpactColor(news.impact)} className="text-xs">
                        {news.impact === 'high' ? 'Impact élevé' : 
                         news.impact === 'medium' ? 'Impact moyen' : 'Impact faible'}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {news.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-3">
                      {news.summary}
                    </CardDescription>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {news.source} • {news.time}
                      </div>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {marketAnalysis.map((analysis) => (
                <Card key={analysis.symbol}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full ${analysis.color} flex items-center justify-center text-white font-bold text-sm`}>
                          {analysis.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{analysis.crypto}</CardTitle>
                          <CardDescription>{analysis.symbol}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">
                          ${analysis.price.toLocaleString()}
                        </div>
                        <div className={`text-sm flex items-center gap-1 ${
                          analysis.change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {analysis.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {analysis.change >= 0 ? '+' : ''}{analysis.change}%
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium mb-1">Analyse</div>
                        <div className="text-sm text-muted-foreground">
                          {analysis.analysis}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Recommandation:</span>
                        <Badge variant={
                          analysis.recommendation === 'Achat' ? 'default' :
                          analysis.recommendation === 'Vente' ? 'destructive' : 'secondary'
                        }>
                          {analysis.recommendation}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Market Sentiment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Sentiment du Marché
                </CardTitle>
                <CardDescription>
                  Analyse globale basée sur les indicateurs techniques et fondamentaux
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500 mb-2">75%</div>
                    <div className="text-sm text-muted-foreground">Optimiste</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-500 mb-2">20%</div>
                    <div className="text-sm text-muted-foreground">Neutre</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500 mb-2">5%</div>
                    <div className="text-sm text-muted-foreground">Pessimiste</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default NewsCenter;