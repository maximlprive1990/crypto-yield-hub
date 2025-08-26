import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import StatsCard from "@/components/StatsCard";
import TonStaking from "@/components/TonStaking";

const Index = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      {/* Hero Section with Authentication Info */}
      <section className="bg-primary/10 py-24">
        <div className="container mx-auto text-center">
          <div className="flex justify-end mb-4">
            <Button variant="outline" onClick={handleSignOut}>
              {t("auth.signout")}
            </Button>
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">
            {t("index.welcome")}
            {user ? `, ${user.email}!` : "!"}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            {t("index.subtitle")}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="animate-pulse">
              {t("index.start")}
            </Button>
            <Button variant="outline" size="lg">
              {t("index.learn")}
            </Button>
          </div>
        </div>
      </section>

      {/* TON Staking Section */}
      <TonStaking />

      {/* Existing sections */}
      <section className="py-20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StatsCard
              icon="⛏️"
              title="Mining Power"
              value="1.2K TH/s"
              description="Active mining rate"
            />
            <StatsCard
              icon="💰"
              title="Total Earned"
              value="$2,450"
              description="Lifetime earnings"
            />
            <StatsCard
              icon="📈"
              title="Efficiency"
              value="94.5%"
              description="Current efficiency"
            />
            <StatsCard
              icon="🎯"
              title="Active Users"
              value="15.2K"
              description="Community size"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
