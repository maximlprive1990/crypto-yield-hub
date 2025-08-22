import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface DepositTransaction {
  id: string;
  transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  confirmed_at?: string;
  payment_method: string;
}

// Cryptomonnaies supportées par FaucetPay et Payeer
const SUPPORTED_CRYPTOCURRENCIES = [
  { value: 'BTC', label: 'Bitcoin (BTC)', icon: '₿' },
  { value: 'ETH', label: 'Ethereum (ETH)', icon: 'Ξ' },
  { value: 'LTC', label: 'Litecoin (LTC)', icon: 'Ł' },
  { value: 'DOGE', label: 'Dogecoin (DOGE)', icon: 'Ð' },
  { value: 'BCH', label: 'Bitcoin Cash (BCH)', icon: '₿' },
  { value: 'DASH', label: 'Dash (DASH)', icon: 'Ð' },
  { value: 'ZEC', label: 'Zcash (ZEC)', icon: 'ⓩ' },
  { value: 'DGB', label: 'DigiByte (DGB)', icon: 'D' },
  { value: 'TRX', label: 'TRON (TRX)', icon: '🔺' },
  { value: 'FEY', label: 'Feyorra (FEY)', icon: 'F' },
  { value: 'SOL', label: 'Solana (SOL)', icon: '☀️' },
  { value: 'ADA', label: 'Cardano (ADA)', icon: '₳' },
  { value: 'XRP', label: 'Ripple (XRP)', icon: 'X' },
  { value: 'USDT', label: 'Tether (USDT)', icon: '₮' },
  { value: 'USDC', label: 'USD Coin (USDC)', icon: '$' },
  { value: 'BNB', label: 'Binance Coin (BNB)', icon: 'B' },
];

const PAYMENT_METHODS = [
  { value: 'faucetpay', label: 'FaucetPay', icon: '🚰' },
  { value: 'payeer', label: 'Payeer', icon: '💳' },
  { value: 'coinbase', label: 'Coinbase', icon: '🔵' },
  { value: 'binance', label: 'Binance', icon: '🟡' },
  { value: 'other', label: 'Autre', icon: '📱' },
];

export const CryptoDepositSystem: React.FC = () => {
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulation des données de dépôt pour la démo
  useEffect(() => {
    const mockDeposits: DepositTransaction[] = [
      {
        id: '1',
        transaction_id: 'TXN123456789',
        amount: 0.001,
        currency: 'BTC',
        status: 'confirmed',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        confirmed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        payment_method: 'faucetpay'
      },
      {
        id: '2',
        transaction_id: 'TXN987654321',
        amount: 50,
        currency: 'USDT',
        status: 'pending',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        payment_method: 'payeer'
      }
    ];
    setDeposits(mockDeposits);
  }, []);

  const handleSubmitDeposit = async () => {
    if (!transactionId || !amount || !selectedCurrency || !selectedPaymentMethod) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs requis",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(amount) <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulation d'une API call pour soumettre le dépôt
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newDeposit: DepositTransaction = {
        id: Date.now().toString(),
        transaction_id: transactionId,
        amount: parseFloat(amount),
        currency: selectedCurrency,
        status: 'pending',
        created_at: new Date().toISOString(),
        payment_method: selectedPaymentMethod
      };

      setDeposits(prev => [newDeposit, ...prev]);

      // Simulation de validation automatique après 15 minutes à 4 heures
      const validationDelay = Math.random() * (4 * 60 - 15) + 15; // 15 min à 4h en minutes
      setTimeout(() => {
        setDeposits(prev => prev.map(dep => 
          dep.id === newDeposit.id 
            ? { ...dep, status: Math.random() > 0.1 ? 'confirmed' : 'rejected', confirmed_at: new Date().toISOString() }
            : dep
        ));
      }, validationDelay * 60 * 1000);

      toast({
        title: "Dépôt soumis avec succès",
        description: `Votre transaction ${transactionId} est en cours de vérification. Délai de validation: 15 minutes à 4 heures.`
      });

      // Reset form
      setTransactionId('');
      setAmount('');
      setSelectedCurrency('');
      setSelectedPaymentMethod('');

    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la soumission du dépôt",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning border-warning">En attente</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-success border-success">Confirmé</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulaire de dépôt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💰 Dépôt Cryptomonnaie
          </CardTitle>
          <CardDescription>
            Déposez vos cryptomonnaies via FaucetPay, Payeer ou d'autres plateformes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Méthode de paiement</label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la méthode" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      <div className="flex items-center gap-2">
                        <span>{method.icon}</span>
                        <span>{method.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cryptomonnaie</label>
              <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez la crypto" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_CRYPTOCURRENCIES.map((crypto) => (
                    <SelectItem key={crypto.value} value={crypto.value}>
                      <div className="flex items-center gap-2">
                        <span>{crypto.icon}</span>
                        <span>{crypto.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">ID de Transaction (TXID)</label>
            <Input
              placeholder="Entrez l'ID de votre transaction"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Montant déposé</label>
            <Input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleSubmitDeposit}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Soumission en cours..." : "Soumettre le dépôt"}
          </Button>

          <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <strong>⏱️ Délai de validation:</strong> 15 minutes à 4 heures<br />
            <strong>🔍 Vérification:</strong> Automatique via blockchain<br />
            <strong>📧 Notification:</strong> Vous serez notifié du statut
          </div>
        </CardContent>
      </Card>

      {/* Historique des dépôts */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Historique des dépôts</CardTitle>
          <CardDescription>
            Suivez le statut de vos dépôts en temps réel
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun dépôt effectué pour le moment
            </div>
          ) : (
            <div className="space-y-4">
              {deposits.map((deposit) => (
                <div key={deposit.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(deposit.status)}
                    <div>
                      <div className="font-medium">
                        {deposit.amount} {deposit.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deposit.transaction_id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTimeAgo(deposit.created_at)} • {PAYMENT_METHODS.find(p => p.value === deposit.payment_method)?.label}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(deposit.status)}
                    {deposit.confirmed_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Confirmé {formatTimeAgo(deposit.confirmed_at)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};