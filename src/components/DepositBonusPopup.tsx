import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Coins, Zap, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth as useAuth } from "@/hooks/useLocalAuth";

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
      <DialogContent className="max-w-sm sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold gradient-text">
            <Coins className="h-5 w-5" />
            BONUS MEGA DÉPÔT 200%
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Bonus Exclusif
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 pt-0">
              <div className="flex items-center gap-2 text-xs">
                <Coins className="h-3 w-3 text-yellow-500" />
                <span className="font-medium">+200% DeadSpot Coins</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Zap className="h-3 w-3 text-blue-500" />
                <span className="font-medium">+200% GH/s Mining</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span className="font-medium">Bonus Dépôt x1.35</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Adresse de Dépôt TON</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <Label className="text-xs text-muted-foreground">Adresse</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input 
                    value={tonAddress} 
                    readOnly 
                    className="text-xs font-mono h-8"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(tonAddress)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">Memo (Obligatoire)</Label>
                <div className="flex items-center gap-1 mt-1">
                  <Input 
                    value={memo} 
                    readOnly 
                    className="text-xs font-mono h-8"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(memo)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <div>
              <Label htmlFor="amount" className="text-sm">Montant Déposé (TON)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="h-8"
              />
            </div>

            <div>
              <Label htmlFor="txid" className="text-sm">ID Transaction (FaucetPay)</Label>
              <Input
                id="txid"
                placeholder="Votre ID de transaction"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                className="h-8"
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
            <p className="font-medium">⏱️ Délai: 1-10h</p>
            <p>Utilisez FaucetPay avec memo obligatoire.</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1 h-8 text-sm">
              Annuler
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !depositAmount || !txId}
              className="flex-1 h-8 text-sm"
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