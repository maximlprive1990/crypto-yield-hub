import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Smartphone, Mail, Key, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const SecurityCenter = () => {
  const { toast } = useToast();
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    emailNotifications: true,
    loginAlerts: true,
    withdrawalConfirmation: true,
    sessionTimeout: true
  });

  const securityScore = Object.values(securitySettings).filter(Boolean).length * 20;

  const recentActivity = [
    {
      action: "Connexion réussie",
      location: "Paris, France",
      device: "Chrome sur Windows",
      time: "Il y a 2 heures",
      status: "success"
    },
    {
      action: "Modification de mot de passe",
      location: "Paris, France", 
      device: "Chrome sur Windows",
      time: "Il y a 3 jours",
      status: "success"
    },
    {
      action: "Tentative de connexion échouée",
      location: "Location inconnue",
      device: "Inconnu",
      time: "Il y a 5 jours",
      status: "warning"
    }
  ];

  const handleSettingChange = (setting: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
    
    toast({
      title: "Paramètre mis à jour",
      description: `${setting} ${value ? 'activé' : 'désactivé'} avec succès.`,
    });
  };

  const enable2FA = () => {
    toast({
      title: "2FA en cours d'activation",
      description: "Veuillez scanner le QR code avec votre application d'authentification.",
    });
  };

  return (
    <section className="py-20 px-6 bg-secondary/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Centre de Sécurité
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Protégez votre compte avec nos outils de sécurité avancés
          </p>
        </div>

        {/* Security Score */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Score de Sécurité
              </CardTitle>
              <CardDescription>
                Votre niveau de protection actuel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Niveau de sécurité</span>
                    <span className="text-sm">{securityScore}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        securityScore >= 80 ? 'bg-green-500' :
                        securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${securityScore}%` }}
                    />
                  </div>
                </div>
                <Badge variant={securityScore >= 80 ? 'default' : securityScore >= 60 ? 'secondary' : 'destructive'}>
                  {securityScore >= 80 ? 'Excellent' : securityScore >= 60 ? 'Bon' : 'À améliorer'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Sécurité</CardTitle>
              <CardDescription>
                Configurez vos préférences de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 2FA */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Authentification à 2 facteurs</div>
                    <div className="text-sm text-muted-foreground">
                      Protection supplémentaire avec votre téléphone
                    </div>
                  </div>
                </div>
                {securitySettings.twoFactor ? (
                  <Badge variant="default">Activé</Badge>
                ) : (
                  <Button size="sm" onClick={enable2FA}>
                    Activer
                  </Button>
                )}
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Notifications par email</div>
                    <div className="text-sm text-muted-foreground">
                      Alertes de sécurité par email
                    </div>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.emailNotifications}
                  onCheckedChange={(value) => handleSettingChange('emailNotifications', value)}
                />
              </div>

              {/* Login Alerts */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Alertes de connexion</div>
                    <div className="text-sm text-muted-foreground">
                      Notification des nouvelles connexions
                    </div>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.loginAlerts}
                  onCheckedChange={(value) => handleSettingChange('loginAlerts', value)}
                />
              </div>

              {/* Withdrawal Confirmation */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Confirmation de retrait</div>
                    <div className="text-sm text-muted-foreground">
                      Confirmation par email pour les retraits
                    </div>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.withdrawalConfirmation}
                  onCheckedChange={(value) => handleSettingChange('withdrawalConfirmation', value)}
                />
              </div>

              {/* Session Timeout */}
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <div className="font-semibold">Déconnexion automatique</div>
                    <div className="text-sm text-muted-foreground">
                      Déconnexion après 30 min d'inactivité
                    </div>
                  </div>
                </div>
                <Switch
                  checked={securitySettings.sessionTimeout}
                  onCheckedChange={(value) => handleSettingChange('sessionTimeout', value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activité Récente</CardTitle>
              <CardDescription>
                Vos dernières actions de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.status === 'success' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {activity.location} • {activity.device}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                    {activity.status === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Tips */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Conseil de sécurité :</strong> Utilisez un mot de passe unique et fort, 
              et activez l'authentification à 2 facteurs pour une protection maximale.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Attention :</strong> Ne partagez jamais vos identifiants de connexion 
              et méfiez-vous des emails de phishing.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </section>
  );
};

export default SecurityCenter;