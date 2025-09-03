import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth as useAuth } from "@/hooks/useLocalAuth";

interface FaucetClaimProps {
  
  onOpenSpin?: () => void;
}

interface FaucetClaim {
  id: string;
  user_id: string;
  amount_claimed: number;
  claimed_at: string;
  next_claim_at: string;
}

export const FaucetClaim: React.FC<FaucetClaimProps> = ({ onOpenSpin }) => {
  const [canClaim, setCanClaim] = useState(false);
  const [nextClaimTime, setNextClaimTime] = useState<Date | null>(null);
  const [timeUntilClaim, setTimeUntilClaim] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [totalClaimed, setTotalClaimed] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // UUID helper: detects proper UUID v1-5
  const isUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  useEffect(() => {
    if (user) {
      checkClaimStatus();
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (nextClaimTime) {
        const now = new Date();
        const timeLeft = nextClaimTime.getTime() - now.getTime();
        
        if (timeLeft <= 0) {
          setCanClaim(true);
          setTimeUntilClaim('');
        } else {
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setTimeUntilClaim(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextClaimTime]);

  const checkClaimStatus = async () => {
    if (!user) return;

    try {
      if (!isUUID(user.id)) {
        // Local fallback for non-UUID users
        const last = localStorage.getItem(`faucet_last_${user.id}`);
        if (last) {
          const nextClaim = new Date(last);
          setNextClaimTime(nextClaim);
          setCanClaim(new Date() >= nextClaim);
        } else {
          setCanClaim(true);
        }
        const total = Number(localStorage.getItem(`faucet_total_${user.id}`) || '0');
        setTotalClaimed(total);
        return;
      }

      // Supabase path for UUID users
      const { data, error } = await (supabase.rpc as any)('get_latest_faucet_claim', {
        p_user_id: user.id
      });

      if (error) {
        console.log('No previous claims found:', error);
        setCanClaim(true);
        return;
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const latest = data[0];
        const nextClaim = new Date(latest.next_claim_at);
        const now = new Date();
        setNextClaimTime(nextClaim);
        setCanClaim(now >= nextClaim);
      } else {
        setCanClaim(true);
      }

      const { data: totalData } = await (supabase.rpc as any)('get_total_faucet_claims', {
        p_user_id: user.id
      });

      if (totalData !== null && totalData !== undefined) {
        setTotalClaimed(Number(totalData) || 0);
      }
    } catch (error) {
      console.error('Error checking claim status:', error);
      setCanClaim(true);
    }
  };

  const claimZero = async () => {
    if (!user || !canClaim || claiming) return;

    setClaiming(true);
    try {
      // Generate random amount between 0.00001 and 0.03
      const amount = Math.random() * (0.03 - 0.00001) + 0.00001;
      const roundedAmount = Math.round(amount * 100000) / 100000;

      if (!isUUID(user.id)) {
        // Local fallback: 15 minutes cooldown
        const next = new Date(Date.now() + 15 * 60 * 1000);
        localStorage.setItem(`faucet_last_${user.id}`, next.toISOString());
        const prevTotal = Number(localStorage.getItem(`faucet_total_${user.id}`) || '0');
        localStorage.setItem(`faucet_total_${user.id}`, String(prevTotal + roundedAmount));

        setCanClaim(false);
        setNextClaimTime(next);
        setTotalClaimed(prevTotal + roundedAmount);

        const diamondGain = 0.583;
        toast({
          title: "🎉 Faucet Claim Réussi!",
          description: `Vous avez reçu ${roundedAmount.toFixed(5)} ZERO tokens + ${diamondGain} 💎 diamants!`,
        });
        return;
      }

      // Supabase path
      const { data, error } = await (supabase.rpc as any)('create_faucet_claim', {
        p_user_id: user.id,
        p_amount: roundedAmount
      });

      if (error) throw error;

      if (data && data.success) {
        setCanClaim(false);
        setNextClaimTime(new Date(data.next_claim_at));
        setTotalClaimed(prev => prev + roundedAmount);

        const diamondGain = 0.583;
        toast({
          title: "🎉 Faucet Claim Réussi!",
          description: `Vous avez reçu ${roundedAmount.toFixed(5)} ZERO tokens + ${diamondGain} 💎 diamants!`,
        });
      }

    } catch (error) {
      console.error('Error claiming from faucet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réclamer les tokens. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setClaiming(false);
    }
  };

  if (!user) return null;

  return (
    <Card className="gradient-card mb-8">
      <CardHeader className="text-center">
        <div className="flex justify-between items-center mb-4">
          {onOpenSpin && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOpenSpin}
              className="shadow-neon"
            >
              🎰 Spin Wheel
            </Button>
          )}
          <div>
            <CardTitle className="text-3xl gradient-text">💧 Faucet ZERO</CardTitle>
            <p className="text-muted-foreground">Réclamez des ZERO tokens toutes les 15 minutes!</p>
          </div>
          <div></div>
        </div>
      </CardHeader>
      
      <CardContent className="text-center space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold text-primary">💰 Montant par claim</h3>
            <p className="text-2xl font-bold gradient-text">0.00001 - 0.03 ZERO</p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/50">
            <h3 className="text-lg font-semibold text-primary">📊 Total réclamé</h3>
            <p className="text-2xl font-bold gradient-text">{totalClaimed.toFixed(5)} ZERO</p>
          </div>
        </div>

        <div className="space-y-4">
          {canClaim ? (
            <Button
              onClick={claimZero}
              disabled={claiming}
              size="xl"
              variant="crypto"
              className="w-full max-w-md mx-auto"
            >
              {claiming ? "Réclamation..." : "💧 Réclamer ZERO"}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button
                disabled
                size="xl"
                variant="secondary"
                className="w-full max-w-md mx-auto"
              >
                ⏰ Prochain claim dans: {timeUntilClaim}
              </Button>
              <p className="text-sm text-muted-foreground">
                Vous pouvez réclamer toutes les 15 minutes
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded bg-muted/30">
            <div className="text-primary font-medium">⏱️ Intervalle</div>
            <div>15 minutes</div>
          </div>
          <div className="p-3 rounded bg-muted/30">
            <div className="text-primary font-medium">💎 Min</div>
            <div>0.00001 ZERO</div>
          </div>
          <div className="p-3 rounded bg-muted/30">
            <div className="text-primary font-medium">🎯 Max</div>
            <div>0.03 ZERO</div>
          </div>
          <div className="p-3 rounded bg-muted/30">
            <div className="text-primary font-medium">🔥 Gratuit</div>
            <div>Toujours!</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};