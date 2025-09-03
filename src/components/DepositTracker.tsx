import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useLocalAuth as useAuth } from "@/hooks/useLocalAuth";
import { useToast } from "@/hooks/use-toast";

interface Deposit {
  id: string;
  crypto_type: string;
  amount: number;
  status: string;
  transaction_id: string | null;
  created_at: string;
}

const DepositTracker = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [txId, setTxId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDeposits();
    }
  }, [user]);

  const fetchDeposits = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setDeposits(data);
    }
  };

  const verifyTransaction = async () => {
    if (!txId.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un ID de transaction",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simuler la vérification (dans un vrai système, vous appelleriez une API)
    setTimeout(async () => {
      const { data, error } = await supabase
        .from('deposits')
        .update({ 
          status: 'verified',
          verified_at: new Date().toISOString(),
          transaction_id: txId
        })
        .eq('transaction_id', txId)
        .eq('user_id', user?.id);

      if (!error) {
        toast({
          title: "Transaction vérifiée",
          description: "Votre dépôt a été confirmé avec succès",
        });
        fetchDeposits();
        setTxId("");
      } else {
        toast({
          title: "Transaction non trouvée",
          description: "Aucun dépôt trouvé avec cet ID de transaction",
          variant: "destructive"
        });
      }
      setLoading(false);
    }, 2000);
  };

  const getTotalByType = (cryptoType: string) => {
    return deposits
      .filter(d => d.crypto_type === cryptoType && d.status === 'verified')
      .reduce((sum, d) => sum + Number(d.amount), 0);
  };

  const cryptoTypes = ['BTC', 'ETH', 'LTC', 'XRP', 'ADA'];

  return (
    <div className="space-y-6">
      {/* Totaux par crypto */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {cryptoTypes.map(crypto => (
          <Card key={crypto} className="gradient-card border-primary/20">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-primary">{crypto}</div>
              <div className="text-sm text-muted-foreground">Déposé</div>
              <div className="text-xl font-semibold">
                {getTotalByType(crypto).toFixed(8)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Vérification de transaction */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Vérifier un dépôt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="ID de transaction..."
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={verifyTransaction}
              disabled={loading}
              variant="crypto"
            >
              {loading ? "Vérification..." : "Vérifier"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historique des dépôts */}
      <Card className="gradient-card border-primary/20">
        <CardHeader>
          <CardTitle>Historique des dépôts</CardTitle>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun dépôt trouvé
            </p>
          ) : (
            <div className="space-y-3">
              {deposits.map(deposit => (
                <div key={deposit.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{deposit.amount} {deposit.crypto_type}</span>
                      <Badge variant={deposit.status === 'verified' ? 'default' : 'secondary'}>
                        {deposit.status === 'verified' ? 'Vérifié' : 'En attente'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {deposit.transaction_id && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {deposit.transaction_id.slice(0, 8)}...
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DepositTracker;