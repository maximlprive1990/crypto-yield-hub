import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [referralCode, setReferralCode] = useState('');

  console.log("Auth component - user:", user, "loading:", loading);

  useEffect(() => {
    // Check for referral code in URL
    const ref = searchParams.get('ref');
    if (ref) {
      setReferralCode(ref.toUpperCase());
    }
  }, [searchParams]);

  // Redirect if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Chargement de l'authentification...</p>
        </div>
      </div>
    );
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    await signIn(email, password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const username = formData.get('username') as string;
    const inputReferralCode = formData.get('referralCode') as string;
    
    const { error } = await signUp(email, password, username);
    
    // If signup successful and there's a referral code, apply it
    if (!error && (referralCode || inputReferralCode)) {
      const codeToUse = inputReferralCode || referralCode;
      try {
        // Wait a bit for the user to be created and trigger to run
        setTimeout(async () => {
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            await supabase.rpc('process_referral', {
              p_referrer_code: codeToUse.toUpperCase(),
              p_referred_user_id: userData.user.id
            });
          }
        }, 2000);
      } catch (refError) {
        console.error('Error applying referral code:', refError);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-glow border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="gradient-text text-2xl font-bold">CryptoStake Pro</CardTitle>
          <CardDescription>
            Accédez à votre plateforme de staking et de mining
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Connexion</TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="crypto"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              {referralCode && (
                <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-success">🎁 Code de parrainage détecté !</p>
                      <p className="text-xs text-muted-foreground">Vous gagnerez 5 tokens DeadSpot à l'inscription</p>
                    </div>
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      {referralCode}
                    </Badge>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Nom d'utilisateur</Label>
                  <Input
                    id="signup-username"
                    name="username"
                    type="text"
                    required
                    placeholder="votreusername"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    placeholder="votre@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    minLength={6}
                  />
                </div>
                
                {!referralCode && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-referral">Code de parrainage (optionnel)</Label>
                    <Input
                      id="signup-referral"
                      name="referralCode"
                      type="text"
                      placeholder="Code d'un ami"
                      className="font-mono text-center"
                      maxLength={8}
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  variant="crypto"
                  disabled={isLoading}
                >
                  {isLoading ? "Inscription..." : "S'inscrire"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;