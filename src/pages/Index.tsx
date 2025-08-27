
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "@/components/StatsCard";
import TonStaking from "@/components/TonStaking";
import { Navigate } from "react-router-dom";

const Index = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
              Déconnexion
            </Button>
          </div>
          <h1 className="text-5xl font-bold text-primary mb-4">
            Bienvenue{user ? `, ${user.email}!` : "!"}
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Plateforme de staking et de minage décentralisée
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="animate-pulse">
              Commencer
            </Button>
            <Button variant="outline" size="lg">
              En savoir plus
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
              color="bg-primary/10"
            />
            <StatsCard
              icon="💰"
              title="Total Earned"
              value="$2,450"
              color="bg-success/10"
            />
            <StatsCard
              icon="📈"
              title="Efficiency"
              value="94.5%"
              color="bg-warning/10"
            />
            <StatsCard
              icon="🎯"
              title="Active Users"
              value="15.2K"
              color="bg-info/10"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
