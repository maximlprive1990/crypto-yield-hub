import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ZeroWalletProps {
  zeroBalance: number;
  onWithdraw: (amount: number) => void;
}

export const ZeroWallet: React.FC<ZeroWalletProps> = ({ zeroBalance, onWithdraw }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Veuillez entrer un montant valide",
        variant: "destructive"
      });
      return;
    }

    if (amount > zeroBalance) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de ZERO coins",
        variant: "destructive"
      });
      return;
    }

    if (!walletAddress.trim()) {
      toast({
        title: "Adresse manquante",
        description: "Veuillez entrer une adresse de portefeuille",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const processingHours = Math.floor(Math.random() * 23) + 2; // 2-24 hours
      const estimatedCompletion = new Date();
      estimatedCompletion.setHours(estimatedCompletion.getHours() + processingHours);

      const { data, error } = await supabase
        .from('zero_withdrawals')
        .insert({
          user_id: user.id,
          amount: amount,
          wallet_address: walletAddress.trim(),
          processing_time_hours: processingHours,
          estimated_completion: estimatedCompletion.toISOString()
        });

      if (error) throw error;

      // Update local balance
      onWithdraw(amount);

      // Show success dialog
      setIsDialogOpen(false);
      toast({
        title: "Retrait en cours",
        description: `Votre retrait de ${amount.toFixed(6)} ZERO est en cours de traitement. Temps estimé: ${processingHours}h`,
      });

      // Reset form
      setWithdrawAmount('');
      setWalletAddress('');

    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du retrait",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="gradient-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          ZERO Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Solde ZERO</p>
            <div className="text-3xl font-bold gradient-text">
              {zeroBalance.toFixed(6)} ZERO
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="crypto" 
                className="w-full"
                disabled={zeroBalance <= 0}
              >
                💸 Échanger / Retirer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Retrait de ZERO Coins</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Montant à retirer</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.000001"
                    min="0.000001"
                    max={zeroBalance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.000000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Disponible: {zeroBalance.toFixed(6)} ZERO
                  </p>
                </div>

                <div>
                  <Label htmlFor="wallet">Adresse de portefeuille</Label>
                  <Input
                    id="wallet"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Entrez votre adresse de portefeuille ZERO"
                  />
                </div>

                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">⏰ Temps de traitement</h4>
                  <p className="text-xs text-muted-foreground">
                    Votre retrait sera traité dans un délai de 2h à 24h. 
                    Vous recevrez une notification une fois le transfert effectué.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Annuler
                  </Button>
                  <Button
                    variant="crypto"
                    onClick={handleWithdraw}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Traitement...' : 'Confirmer Retrait'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <div className="text-xs text-center text-muted-foreground">
            <p>💡 Gagnez des ZERO coins en combattant des ennemis!</p>
            <p>Chaque victoire rapporte entre 0.000001 et 0.001 ZERO</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};