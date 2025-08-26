
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFarmingData } from "@/hooks/useFarmingData";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { ClickerGame } from "@/components/ClickerGame";
import { MiningFarm } from "@/components/MiningFarm";
import MiningSection from "@/components/MiningSection";
import { RewardsSystem } from "@/components/RewardsSystem";
import { ZeroWallet } from "@/components/rpg/ZeroWallet";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const { state: farm, addDeadspot, addDiamonds } = useFarmingData();

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleSaveName = async () => {
    setIsLoading(true);
    // Simulating a save operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({
      title: t("index.name_saved"),
      description: `${t("index.your_name")} ${name} !`,
    });
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="w-[300px] h-[40px]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section */}
      <section className="bg-primary/10 py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-primary mb-4">
            {t("index.welcome")}
            {user ? `, ${user.email}!` : "!"}
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            {t("index.hero_description")}
          </p>
          <div className="space-x-4">
            <Button size="lg">{t("index.get_started")}</Button>
            <Button variant="outline" size="lg">
              {t("index.learn_more")}
            </Button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 space-y-16">
        {/* Name Input Section */}
        <section id="name-input" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold">{t("index.customize")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("index.name_description")}
            </p>
          </div>
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>{t("index.enter_name")}</CardTitle>
              <CardDescription>{t("index.name_preference")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("index.your_name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveName} disabled={isLoading}>
                {isLoading ? (
                  <Sparkles className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                {t("index.save")}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Click Game Section */}
        <section id="click-game" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              💀 {t("clicker.title")}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("clicker.description")}
            </p>
          </div>
          <ClickerGame />
        </section>

        {/* Mining Section */}
        <section id="mining" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🔥 Mining JavaScript Actif
            </h2>
            <p className="text-muted-foreground text-lg">
              Minez des cryptomonnaies directement dans votre navigateur avec CoinIMP
            </p>
          </div>
          <MiningSection />
        </section>

        {/* Mining Farm Section */}
        <section id="mining-farm" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🏭 Mining Farm
            </h2>
            <p className="text-muted-foreground text-lg">
              Achetez des mineurs et générez des cryptomonnaies!
            </p>
          </div>
          <MiningFarm
            deadspotCoins={farm.deadspotCoins}
            setDeadspotCoins={addDeadspot}
            diamonds={farm.diamonds}
            setDiamonds={addDiamonds}
          />
        </section>

        {/* Rewards Section */}
        <section id="rewards" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🎁 Récompenses
            </h2>
            <p className="text-muted-foreground text-lg">
              Réclamez vos récompenses quotidiennes et bonus spéciaux
            </p>
          </div>
          <RewardsSystem
            deadspotCoins={farm.deadspotCoins}
            setDeadspotCoins={addDeadspot}
            diamonds={farm.diamonds}
            setDiamonds={addDiamonds}
            miningExp={farm.miningExp}
            setMiningExp={(value) => {}}
            level={farm.level}
            setLevel={(value) => {}}
          />
        </section>

        {/* Zero Wallet Section */}
        <section id="zero-wallet" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              💼 Zero Wallet
            </h2>
            <p className="text-muted-foreground text-lg">
              Gérez vos retraits et votre portefeuille zéro
            </p>
          </div>
          <ZeroWallet
            zeroBalance={0}
            onWithdraw={() => {}}
          />
        </section>

        {/* Farming Section (Placeholder) */}
        <section id="farming" className="space-y-6">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              🌱 Farming (Coming Soon)
            </h2>
            <p className="text-muted-foreground text-lg">
              {t("index.farming_description")}
            </p>
          </div>
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>{t("index.farming_title")}</CardTitle>
              <CardDescription>{t("index.farming_details")}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>{t("index.farming_content")}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Index;
