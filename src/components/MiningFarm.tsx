import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pickaxe, ShoppingCart, TrendingUp, Cpu } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Miner {
  id: string;
  name: string;
  hashrate: number;
  unit: "GH/s" | "TH/s";
  price_deadspot: number;
  price_diamonds: number;
  power_consumption: number;
  efficiency: number;
  owned: number;
}

interface MiningSession {
  crypto: string;
  amount: number;
  rate: number;
}

const MiningFarm = ({ 
  deadspotCoins, 
  setDeadspotCoins, 
  diamonds, 
  setDiamonds 
}: {
  deadspotCoins: number;
  setDeadspotCoins: (value: number | ((prev: number) => number)) => void;
  diamonds: number;
  setDiamonds: (value: number | ((prev: number) => number)) => void;
}) => {
  const { toast } = useToast();

  const [miners, setMiners] = useState<Miner[]>([
    { id: "basic", name: "Mineur Basic", hashrate: 1, unit: "GH/s", price_deadspot: 10, price_diamonds: 0, power_consumption: 50, efficiency: 0.02, owned: 0 },
    { id: "standard", name: "Mineur Standard", hashrate: 5, unit: "GH/s", price_deadspot: 45, price_diamonds: 2, power_consumption: 200, efficiency: 0.025, owned: 0 },
    { id: "advanced", name: "Mineur Avancé", hashrate: 15, unit: "GH/s", price_deadspot: 120, price_diamonds: 8, power_consumption: 500, efficiency: 0.03, owned: 0 },
    { id: "pro", name: "Mineur Pro", hashrate: 50, unit: "GH/s", price_deadspot: 350, price_diamonds: 25, power_consumption: 1200, efficiency: 0.042, owned: 0 },
    { id: "expert", name: "Mineur Expert", hashrate: 150, unit: "GH/s", price_deadspot: 900, price_diamonds: 75, power_consumption: 2500, efficiency: 0.06, owned: 0 },
    { id: "master", name: "Mineur Master", hashrate: 500, unit: "GH/s", price_deadspot: 2500, price_diamonds: 200, power_consumption: 5000, efficiency: 0.1, owned: 0 },
    { id: "titan_1", name: "Titan T1", hashrate: 1, unit: "TH/s", price_deadspot: 6000, price_diamonds: 500, power_consumption: 8000, efficiency: 0.125, owned: 0 },
    { id: "titan_5", name: "Titan T5", hashrate: 5, unit: "TH/s", price_deadspot: 25000, price_diamonds: 2000, power_consumption: 30000, efficiency: 0.167, owned: 0 },
    { id: "titan_15", name: "Titan T15", hashrate: 15, unit: "TH/s", price_deadspot: 65000, price_diamonds: 5500, power_consumption: 75000, efficiency: 0.2, owned: 0 },
    { id: "quantum", name: "Quantum Miner", hashrate: 50, unit: "TH/s", price_deadspot: 200000, price_diamonds: 15000, power_consumption: 150000, efficiency: 0.333, owned: 0 },
    { id: "singularity", name: "Singularity", hashrate: 100, unit: "TH/s", price_deadspot: 500000, price_diamonds: 40000, power_consumption: 250000, efficiency: 0.4, owned: 0 },
  ]);

  const [miningSessions, setMiningSessions] = useState<MiningSession[]>([
    { crypto: "BTC", amount: 0, rate: 0 },
    { crypto: "ETH", amount: 0, rate: 0 },
    { crypto: "DOGE", amount: 0, rate: 0 },
    { crypto: "LTC", amount: 0, rate: 0 },
    { crypto: "BCH", amount: 0, rate: 0 },
  ]);

  // Calculate total hashrate
  const totalHashrate = miners.reduce((total, miner) => {
    const hashrateInGH = miner.unit === "TH/s" ? miner.hashrate * 1000 : miner.hashrate;
    return total + (hashrateInGH * miner.owned);
  }, 0);

  // Mining automation
  useEffect(() => {
    if (totalHashrate > 0) {
      const interval = setInterval(() => {
        setMiningSessions(prev => prev.map(session => {
          const baseRate = totalHashrate * 0.0001; // Base mining rate
          const cryptoMultiplier = session.crypto === "BTC" ? 1 : 
                                  session.crypto === "ETH" ? 0.8 : 
                                  session.crypto === "DOGE" ? 2 : 
                                  session.crypto === "LTC" ? 1.2 : 0.9;
          
          const miningRate = baseRate * cryptoMultiplier;
          return {
            ...session,
            amount: session.amount + miningRate,
            rate: miningRate
          };
        }));
      }, 5000); // Mining every 5 seconds

      return () => clearInterval(interval);
    }
  }, [totalHashrate]);

  const buyMiner = (minerId: string) => {
    const miner = miners.find(m => m.id === minerId);
    if (!miner) return;

    if (deadspotCoins < miner.price_deadspot || diamonds < miner.price_diamonds) {
      toast({
        title: "Fonds insuffisants!",
        description: `Il vous faut ${miner.price_deadspot} DeadSpot coins et ${miner.price_diamonds} diamants`,
        variant: "destructive"
      });
      return;
    }

    setDeadspotCoins(prev => prev - miner.price_deadspot);
    setDiamonds(prev => prev - miner.price_diamonds);

    setMiners(prev => prev.map(m => 
      m.id === minerId 
        ? { 
            ...m, 
            owned: m.owned + 1,
            price_deadspot: Math.floor(m.price_deadspot * 1.15),
            price_diamonds: Math.floor(m.price_diamonds * 1.1)
          }
        : m
    ));

    toast({
      title: "Mineur acheté!",
      description: `${miner.name} ajouté à votre ferme!`,
    });
  };

  const sellMiner = (minerId: string) => {
    const miner = miners.find(m => m.id === minerId);
    if (!miner || miner.owned === 0) return;

    const sellPriceDeadspot = Math.floor(miner.price_deadspot * 0.7);
    const sellPriceDiamonds = Math.floor(miner.price_diamonds * 0.7);

    setDeadspotCoins(prev => prev + sellPriceDeadspot);
    setDiamonds(prev => prev + sellPriceDiamonds);

    setMiners(prev => prev.map(m => 
      m.id === minerId 
        ? { 
            ...m, 
            owned: m.owned - 1,
            price_deadspot: Math.floor(m.price_deadspot / 1.15),
            price_diamonds: Math.floor(m.price_diamonds / 1.1)
          }
        : m
    ));

    toast({
      title: "Mineur vendu!",
      description: `+${sellPriceDeadspot} DeadSpot coins et +${sellPriceDiamonds} diamants`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Mining Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalHashrate.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total GH/s</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{miners.reduce((total, m) => total + m.owned, 0)}</div>
            <div className="text-sm text-muted-foreground">Mineurs Actifs</div>
          </CardContent>
        </Card>
        
        <Card className="gradient-card border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{miners.reduce((total, m) => total + (m.power_consumption * m.owned), 0)}</div>
            <div className="text-sm text-muted-foreground">Consommation (W)</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Miners Shop */}
        <Card className="gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-primary" />
              Magasin de Mineurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-96 overflow-y-auto">
            {miners.map((miner) => (
              <div key={miner.id} className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="flex-1">
                  <div className="font-medium">{miner.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {miner.hashrate} {miner.unit} • {miner.power_consumption}W
                  </div>
                  <div className="text-xs text-primary">Efficacité: {(miner.efficiency * 100).toFixed(1)}%</div>
                  {miner.owned > 0 && (
                    <Badge variant="outline" className="mt-1">
                      Possédé: {miner.owned}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2 ml-4">
                  <Button
                    onClick={() => buyMiner(miner.id)}
                    disabled={deadspotCoins < miner.price_deadspot || diamonds < miner.price_diamonds}
                    variant="outline"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {miner.price_deadspot}💰 {miner.price_diamonds}💎
                  </Button>
                  {miner.owned > 0 && (
                    <Button
                      onClick={() => sellMiner(miner.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Vendre
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Mining Progress */}
        <Card className="gradient-card border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pickaxe className="w-6 h-6 text-warning" />
              Mining en Cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Revenus de mining en temps réel</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Crypto</TableHead>
                  <TableHead>Montant Miné</TableHead>
                  <TableHead>Taux/5s</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {miningSessions.map((session) => (
                  <TableRow key={session.crypto}>
                    <TableCell className="font-medium">{session.crypto}</TableCell>
                    <TableCell>{session.amount.toFixed(6)}</TableCell>
                    <TableCell className="text-success">+{session.rate.toFixed(6)}</TableCell>
                    <TableCell>
                      {totalHashrate > 0 ? (
                        <Badge variant="secondary" className="bg-success/20 text-success">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Actif
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Cpu className="w-3 h-3 mr-1" />
                          Inactif
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MiningFarm;