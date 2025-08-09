import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Eye, EyeOff, Wallet, BarChart3 } from 'lucide-react';
import { useState } from 'react';

const PortfolioTracker = () => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  
  const portfolioData = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      amount: 0.00124,
      value: 52.34,
      change24h: 2.45,
      color: "bg-orange-500",
      allocation: 35
    },
    {
      symbol: "ETH", 
      name: "Ethereum",
      amount: 0.0234,
      value: 38.90,
      change24h: -1.23,
      color: "bg-blue-500",
      allocation: 26
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      amount: 45.67,
      value: 28.45,
      change24h: 5.67,
      color: "bg-purple-500",
      allocation: 19
    },
    {
      symbol: "SOL",
      name: "Solana", 
      amount: 0.567,
      value: 15.23,
      change24h: 3.21,
      color: "bg-purple-400",
      allocation: 10
    },
    {
      symbol: "TRX",
      name: "TRON",
      amount: 234.56,
      value: 9.87,
      change24h: -0.45,
      color: "bg-red-500",
      allocation: 7
    },
    {
      symbol: "DOGE",
      name: "Dogecoin",
      amount: 89.12,
      value: 4.21,
      change24h: 1.23,
      color: "bg-yellow-500",
      allocation: 3
    }
  ];

  const totalValue = portfolioData.reduce((sum, item) => sum + item.value, 0);
  const totalChange24h = portfolioData.reduce((sum, item) => sum + (item.value * item.change24h / 100), 0);
  const totalChangePercent = (totalChange24h / totalValue) * 100;

  return (
    <section className="py-20 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Portfolio Tracker
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Suivez la performance de votre portefeuille crypto en temps réel
          </p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Valeur Totale du Portfolio
                  </CardTitle>
                  <CardDescription>Toutes vos positions crypto</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                >
                  {isBalanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold">
                    {isBalanceVisible ? `$${totalValue.toFixed(2)}` : '****'}
                  </div>
                  <div className={`flex items-center gap-1 ${totalChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {totalChangePercent >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-semibold">
                      {isBalanceVisible ? `${totalChangePercent >= 0 ? '+' : ''}${totalChangePercent.toFixed(2)}%` : '**%'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {isBalanceVisible ? `${totalChange24h >= 0 ? '+' : ''}$${totalChange24h.toFixed(2)}` : '****'} dernières 24h
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Répartition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolioData.slice(0, 3).map((asset) => (
                  <div key={asset.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${asset.color}`} />
                      <span className="text-sm font-medium">{asset.symbol}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{asset.allocation}%</span>
                  </div>
                ))}
                <div className="text-xs text-muted-foreground pt-2">
                  +3 autres actifs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Portfolio Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Positions</CardTitle>
            <CardDescription>Détail de vos holdings crypto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioData.map((asset) => (
                <div key={asset.symbol} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full ${asset.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-semibold">{asset.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {isBalanceVisible ? `${asset.amount} ${asset.symbol}` : '****'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      {isBalanceVisible ? `$${asset.value.toFixed(2)}` : '****'}
                    </div>
                    <div className={`text-sm flex items-center gap-1 ${asset.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {asset.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {isBalanceVisible ? `${asset.change24h >= 0 ? '+' : ''}${asset.change24h.toFixed(2)}%` : '**%'}
                    </div>
                  </div>
                  
                  <div className="w-16">
                    <Progress value={asset.allocation} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PortfolioTracker;