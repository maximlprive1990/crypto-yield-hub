import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Coins, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface DepositBonusPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositBonusPopup({ isOpen, onClose }: DepositBonusPopupProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [txId, setTxId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const tonAddress = "EQD14kgmngE0fNYVs7_9dw78V3rPhNt7_Ee-7X3ykDORQvMp";
  const memo = "492929";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié!",
      description: "Adresse copiée dans le presse-papiers",
    });
  };

  const handleSubmit = async () => {
    if (!user || !depositAmount || !txId) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('deposits')
        .insert([
          {
            user_id: user.id,
            amount: parseFloat(depositAmount),
            crypto_type: 'TON',
            wallet_address: tonAddress,
            transaction_id: txId,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Dépôt soumis!",
        description: "Votre dépôt bonus est en cours de validation (1-10h)",
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la soumission du dépôt",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold gradient-text">
            <Coins className="h-6 w-6" />
            BONUS MEGA DÉPÔT 200%
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Bonus Exclusif
              </CardTitle>
              <CardDescription>
                Obtenez des récompenses incroyables sur votre dépôt!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-yellow-500" />
                <span className="font-medium">+200% DeadSpot Coins</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="font-medium">+200% GH/s Mining</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">Bonus Dépôt x1.35</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Adresse de Dépôt TON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Adresse</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={tonAddress} 
                    readOnly 
                    className="text-xs font-mono"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(tonAddress)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Memo (Obligatoire)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={memo} 
                    readOnly 
                    className="text-xs font-mono"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(memo)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="amount">Montant Déposé (TON)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="txid">ID Transaction (FaucetPay)</Label>
              <Input
                id="txid"
                placeholder="Votre ID de transaction"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
            <p className="font-medium mb-1">⏱️ Délai de validation: 1-10 heures</p>
            <p>Utilisez FaucetPay pour envoyer vers l'adresse TON avec le memo obligatoire.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !depositAmount || !txId}
              className="flex-1"
              variant="crypto"
            >
              {isSubmitting ? "Envoi..." : "Activer le Bonus"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}