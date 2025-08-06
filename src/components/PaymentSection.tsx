import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";

const PaymentSection = () => {
  const [amount, setAmount] = useState("100.00");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("Staking Payment");
  const [orderId, setOrderId] = useState("");
  const [merchantId, setMerchantId] = useState("2247945259");

  const generateOrderId = () => {
    const newOrderId = 'ORDER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    setOrderId(newOrderId);
  };

  const handlePayment = () => {
    if (!merchantId || !orderId || !amount) {
      alert("Veuillez remplir tous les champs requis.");
      return;
    }

    // Créer le formulaire Payeer exact
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://payeer.com/merchant/';
    form.target = '_blank';

    // Préparer les données
    const formattedAmount = parseFloat(amount).toFixed(2);
    const encodedDesc = btoa(description);

    // Note: La signature doit être générée côté serveur avec votre clé secrète
    const tempSign = "SIGNATURE_REQUIRED"; // À remplacer par la vraie signature

    // Créer les champs cachés exacts
    const fields = {
      'm_shop': merchantId,
      'm_orderid': orderId,
      'm_amount': formattedAmount,
      'm_curr': currency,
      'm_desc': encodedDesc,
      'm_sign': tempSign
    };

    // Ajouter les champs au formulaire
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value.toString();
      form.appendChild(input);
    });

    // Ajouter le bouton de soumission
    const submitBtn = document.createElement('input');
    submitBtn.type = 'submit';
    submitBtn.name = 'm_process';
    submitBtn.value = 'send';
    form.appendChild(submitBtn);

    // Ajouter au DOM et soumettre
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-secondary/20 to-primary/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Effectuer un Paiement
          </h2>
          <p className="text-lg text-muted-foreground">
            Payez de manière sécurisée avec Payeer
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulaire de paiement */}
          <Card className="gradient-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💳 Détails du Paiement
              </CardTitle>
              <CardDescription>
                Remplissez les informations pour procéder au paiement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="merchantId">ID Marchand Payeer</Label>
                <Input
                  id="merchantId"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="Votre ID marchand Payeer"
                  className="bg-secondary/50 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-secondary/50 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Devise</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 rounded-md bg-secondary/50 border border-primary/20"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/50 border-primary/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderId">ID de Commande</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Générez un ID automatiquement"
                    className="bg-secondary/50 border-primary/20"
                  />
                  <Button 
                    variant="outline" 
                    onClick={generateOrderId}
                    className="whitespace-nowrap"
                  >
                    Générer ID
                  </Button>
                </div>
              </div>

              <Button 
                variant="crypto" 
                size="lg" 
                className="w-full"
                onClick={handlePayment}
                disabled={!amount || !orderId || !merchantId}
              >
                Procéder au Paiement Payeer
              </Button>
            </CardContent>
          </Card>

          {/* Informations de sécurité */}
          <div className="space-y-6">
            <Card className="border-warning/20">
              <CardHeader>
                <CardTitle className="text-warning flex items-center gap-2">
                  ⚠️ Important - Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <strong>Formulaire Payeer généré:</strong>
                    <br />
                    • action: https://payeer.com/merchant/
                    <br />
                    • method: POST
                    <br />
                    • Encodage: UTF-8
                    <br /><br />
                    <strong>IMPORTANT:</strong> La signature (m_sign) doit être générée côté serveur avec votre clé secrète Payeer.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card className="border-info/20">
              <CardHeader>
                <CardTitle className="text-info flex items-center gap-2">
                  🔒 Méthodes de Paiement Acceptées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span>💳</span>
                    <span>Cartes bancaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>🏦</span>
                    <span>Virements bancaires</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>₿</span>
                    <span>Cryptomonnaies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📱</span>
                    <span>Portefeuilles électroniques</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-success/20">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2">
                  ✅ Sécurité Garantie
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Chiffrement SSL 256 bits</li>
                  <li>• Conformité PCI DSS</li>
                  <li>• Protection anti-fraude</li>
                  <li>• Vérification 3D Secure</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSection;