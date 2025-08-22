import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Pickaxe, ShoppingCart, TrendingUp, Cpu, ArrowDownLeft } from "lucide-react";
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
  price_diamonds: number;
  power_consumption: number;
  efficiency: number;
  owned: number;
  rarity: string;
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
    // Mineurs de base (1-11 existants avec nouveaux prix en diamants)
    { id: "basic", name: "Mineur Basic", hashrate: 1, unit: "GH/s", price_diamonds: 1000, power_consumption: 50, efficiency: 0.02, owned: 0, rarity: "Commun" },
    { id: "standard", name: "Mineur Standard", hashrate: 5, unit: "GH/s", price_diamonds: 8000, power_consumption: 200, efficiency: 0.025, owned: 0, rarity: "Commun" },
    { id: "advanced", name: "Mineur Avancé", hashrate: 15, unit: "GH/s", price_diamonds: 17500, power_consumption: 500, efficiency: 0.03, owned: 0, rarity: "Peu Commun" },
    { id: "pro", name: "Mineur Pro", hashrate: 50, unit: "GH/s", price_diamonds: 35000, power_consumption: 1200, efficiency: 0.042, owned: 0, rarity: "Peu Commun" },
    { id: "expert", name: "Mineur Expert", hashrate: 150, unit: "GH/s", price_diamonds: 60000, power_consumption: 2500, efficiency: 0.06, owned: 0, rarity: "Rare" },
    { id: "master", name: "Mineur Master", hashrate: 500, unit: "GH/s", price_diamonds: 100000, power_consumption: 5000, efficiency: 0.1, owned: 0, rarity: "Rare" },
    { id: "titan_1", name: "Titan T1", hashrate: 1, unit: "TH/s", price_diamonds: 150000, power_consumption: 8000, efficiency: 0.125, owned: 0, rarity: "Épique" },
    { id: "titan_5", name: "Titan T5", hashrate: 5, unit: "TH/s", price_diamonds: 250000, power_consumption: 30000, efficiency: 0.167, owned: 0, rarity: "Épique" },
    { id: "titan_15", name: "Titan T15", hashrate: 15, unit: "TH/s", price_diamonds: 400000, power_consumption: 75000, efficiency: 0.2, owned: 0, rarity: "Légendaire" },
    { id: "quantum", name: "Quantum Miner", hashrate: 50, unit: "TH/s", price_diamonds: 750000, power_consumption: 150000, efficiency: 0.333, owned: 0, rarity: "Légendaire" },
    { id: "singularity", name: "Singularity", hashrate: 100, unit: "TH/s", price_diamonds: 1200000, power_consumption: 250000, efficiency: 0.4, owned: 0, rarity: "Mythique" },
    
    // 28 nouveaux mineurs avec des noms créatifs et des raretés variées
    { id: "crystal_forge", name: "Crystal Forge", hashrate: 200, unit: "TH/s", price_diamonds: 1800000, power_consumption: 400000, efficiency: 0.5, owned: 0, rarity: "Mythique" },
    { id: "void_ripper", name: "Void Ripper", hashrate: 350, unit: "TH/s", price_diamonds: 2500000, power_consumption: 600000, efficiency: 0.583, owned: 0, rarity: "Mythique" },
    { id: "stellar_harvester", name: "Stellar Harvester", hashrate: 500, unit: "TH/s", price_diamonds: 3500000, power_consumption: 850000, efficiency: 0.588, owned: 0, rarity: "Ascendant" },
    { id: "nebula_crusher", name: "Nebula Crusher", hashrate: 750, unit: "TH/s", price_diamonds: 5000000, power_consumption: 1200000, efficiency: 0.625, owned: 0, rarity: "Ascendant" },
    { id: "cosmic_drill", name: "Cosmic Drill", hashrate: 1000, unit: "TH/s", price_diamonds: 7000000, power_consumption: 1600000, efficiency: 0.625, owned: 0, rarity: "Ascendant" },
    { id: "galactic_extractor", name: "Galactic Extractor", hashrate: 1500, unit: "TH/s", price_diamonds: 10000000, power_consumption: 2300000, efficiency: 0.652, owned: 0, rarity: "Divin" },
    { id: "antimatter_engine", name: "Antimatter Engine", hashrate: 2000, unit: "TH/s", price_diamonds: 14000000, power_consumption: 3000000, efficiency: 0.667, owned: 0, rarity: "Divin" },
    { id: "dark_matter_rig", name: "Dark Matter Rig", hashrate: 3000, unit: "TH/s", price_diamonds: 20000000, power_consumption: 4200000, efficiency: 0.714, owned: 0, rarity: "Divin" },
    { id: "phoenix_miner", name: "Phoenix Miner", hashrate: 4500, unit: "TH/s", price_diamonds: 28000000, power_consumption: 6000000, efficiency: 0.75, owned: 0, rarity: "Céleste" },
    { id: "dragon_forge", name: "Dragon Forge", hashrate: 6000, unit: "TH/s", price_diamonds: 38000000, power_consumption: 7800000, efficiency: 0.769, owned: 0, rarity: "Céleste" },
    { id: "shadow_ripper", name: "Shadow Ripper", hashrate: 8000, unit: "TH/s", price_diamonds: 50000000, power_consumption: 10000000, efficiency: 0.8, owned: 0, rarity: "Céleste" },
    { id: "inferno_drill", name: "Inferno Drill", hashrate: 10000, unit: "TH/s", price_diamonds: 65000000, power_consumption: 12500000, efficiency: 0.8, owned: 0, rarity: "Transcendant" },
    { id: "thunder_crusher", name: "Thunder Crusher", hashrate: 12500, unit: "TH/s", price_diamonds: 82000000, power_consumption: 15000000, efficiency: 0.833, owned: 0, rarity: "Transcendant" },
    { id: "lightning_extractor", name: "Lightning Extractor", hashrate: 15000, unit: "TH/s", price_diamonds: 105000000, power_consumption: 17500000, efficiency: 0.857, owned: 0, rarity: "Transcendant" },
    { id: "storm_generator", name: "Storm Generator", hashrate: 18000, unit: "TH/s", price_diamonds: 130000000, power_consumption: 20000000, efficiency: 0.9, owned: 0, rarity: "Éternel" },
    { id: "chaos_engine", name: "Chaos Engine", hashrate: 22000, unit: "TH/s", price_diamonds: 160000000, power_consumption: 24000000, efficiency: 0.917, owned: 0, rarity: "Éternel" },
    { id: "void_devourer", name: "Void Devourer", hashrate: 27000, unit: "TH/s", price_diamonds: 195000000, power_consumption: 28000000, efficiency: 0.964, owned: 0, rarity: "Éternel" },
    { id: "reality_shaper", name: "Reality Shaper", hashrate: 33000, unit: "TH/s", price_diamonds: 240000000, power_consumption: 33000000, efficiency: 1.0, owned: 0, rarity: "Omnipotent" },
    { id: "dimension_ripper", name: "Dimension Ripper", hashrate: 40000, unit: "TH/s", price_diamonds: 295000000, power_consumption: 38000000, efficiency: 1.053, owned: 0, rarity: "Omnipotent" },
    { id: "universe_forge", name: "Universe Forge", hashrate: 48000, unit: "TH/s", price_diamonds: 360000000, power_consumption: 44000000, efficiency: 1.091, owned: 0, rarity: "Omnipotent" },
    { id: "infinity_drill", name: "Infinity Drill", hashrate: 58000, unit: "TH/s", price_diamonds: 440000000, power_consumption: 51000000, efficiency: 1.137, owned: 0, rarity: "Suprême" },
    { id: "eternity_crusher", name: "Eternity Crusher", hashrate: 70000, unit: "TH/s", price_diamonds: 540000000, power_consumption: 59000000, efficiency: 1.186, owned: 0, rarity: "Suprême" },
    { id: "genesis_extractor", name: "Genesis Extractor", hashrate: 85000, unit: "TH/s", price_diamonds: 660000000, power_consumption: 68000000, efficiency: 1.25, owned: 0, rarity: "Suprême" },
    { id: "omega_engine", name: "Omega Engine", hashrate: 100000, unit: "TH/s", price_diamonds: 800000000, power_consumption: 78000000, efficiency: 1.282, owned: 0, rarity: "Absolu" },
    { id: "alpha_generator", name: "Alpha Generator", hashrate: 120000, unit: "TH/s", price_diamonds: 970000000, power_consumption: 90000000, efficiency: 1.333, owned: 0, rarity: "Absolu" },
    { id: "god_miner", name: "God Miner", hashrate: 145000, unit: "TH/s", price_diamonds: 1200000000, power_consumption: 103000000, efficiency: 1.408, owned: 0, rarity: "Absolu" },
    { id: "primordial_forge", name: "Primordial Forge", hashrate: 175000, unit: "TH/s", price_diamonds: 1500000000, power_consumption: 118000000, efficiency: 1.483, owned: 0, rarity: "Primordial" },
    { id: "celestial_ripper", name: "Celestial Ripper", hashrate: 210000, unit: "TH/s", price_diamonds: 1900000000, power_consumption: 135000000, efficiency: 1.556, owned: 0, rarity: "Primordial" },
    { id: "ultimate_destroyer", name: "Ultimate Destroyer", hashrate: 250000, unit: "TH/s", price_diamonds: 2500000000, power_consumption: 155000000, efficiency: 1.613, owned: 0, rarity: "Ultime" },
  ]);

  const [miningSessions, setMiningSessions] = useState<MiningSession[]>([
    { crypto: "BTC", amount: 0, rate: 0 },
    { crypto: "ETH", amount: 0, rate: 0 },
    { crypto: "DOGE", amount: 0, rate: 0 },
    { crypto: "LTC", amount: 0, rate: 0 },
    { crypto: "BCH", amount: 0, rate: 0 },
  ]);

  const [withdrawAmount, setWithdrawAmount] = useState<string>("");

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

    if (diamonds < miner.price_diamonds) {
      toast({
        title: "Fonds insuffisants!",
        description: `Il vous faut ${miner.price_diamonds} diamants`,
        variant: "destructive"
      });
      return;
    }

    setDiamonds(prev => prev - miner.price_diamonds);

    setMiners(prev => prev.map(m => 
      m.id === minerId 
        ? { 
            ...m, 
            owned: m.owned + 1,
            price_diamonds: Math.floor(m.price_diamonds * 1.15)
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

    const sellPriceDiamonds = Math.floor(miner.price_diamonds * 0.7);

    setDiamonds(prev => prev + sellPriceDiamonds);

    setMiners(prev => prev.map(m => 
      m.id === minerId 
        ? { 
            ...m, 
            owned: m.owned - 1,
            price_diamonds: Math.floor(m.price_diamonds / 1.15)
          }
        : m
    ));

    toast({
      title: "Mineur vendu!",
      description: `+${sellPriceDiamonds} diamants`,
    });
  };

  const withdrawDeadspotCoins = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast({
        title: "Montant invalide!",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    // New exchange rate: 100000 hashrate = 0.15 deadspot coins
    const requiredHashrate = (amount / 0.15) * 100000;

    if (totalHashrate < requiredHashrate) {
      toast({
        title: "Hashrate insuffisant!",
        description: `Il vous faut ${requiredHashrate.toLocaleString()} GH/s pour retirer ${amount} DeadSpot coins`,
        variant: "destructive"
      });
      return;
    }

    setDeadspotCoins(prev => prev + amount);
    setWithdrawAmount("");

    toast({
      title: "Retrait effectué!",
      description: `+${amount} DeadSpot coins ajoutés à votre compte`,
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

      {/* Hashrate to DeadSpot Coins Exchange */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownLeft className="w-6 h-6 text-success" />
            Échange Hashrate → DeadSpot Coins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Taux d'échange: 100,000 GH/s = 0.15 DeadSpot coins
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Montant à retirer (DeadSpot coins)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  step="0.01"
                  min="0"
                />
              </div>
              <Button
                onClick={withdrawDeadspotCoins}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                className="px-6"
              >
                <ArrowDownLeft className="w-4 h-4 mr-2" />
                Retirer
              </Button>
            </div>
            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (
              <div className="text-xs text-muted-foreground">
                Hashrate requis: {((parseFloat(withdrawAmount) / 0.15) * 100000).toLocaleString()} GH/s
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
                  <div className="font-medium flex items-center gap-2">
                    {miner.name}
                    <Badge variant="secondary" className="text-xs">
                      {miner.rarity}
                    </Badge>
                  </div>
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
                    disabled={diamonds < miner.price_diamonds}
                    variant="outline"
                    size="sm"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {miner.price_diamonds.toLocaleString()}💎
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