import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Gift, Coins, DollarSign, ArrowUpDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Stat {
  stat_name: string;
  stat_value: number;
  display_format: string;
}

const PlatformStats = () => {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    
    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_stats")
        .select("*")
        .order("stat_name");

      if (error) throw error;
      setStats(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return value >= 1000000 
          ? `$${(value / 1000000).toFixed(1)}M`
          : value >= 1000 
            ? `$${(value / 1000).toFixed(0)}K`
            : `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value >= 1000000
          ? `${(value / 1000000).toFixed(1)}M`
          : value >= 1000
            ? `${(value / 1000).toFixed(1)}K+`
            : value.toLocaleString();
    }
  };

  const getStatIcon = (statName: string) => {
    switch (statName) {
      case 'total_value_locked':
        return <DollarSign className="w-6 h-6" />;
      case 'active_stakers':
        return <Users className="w-6 h-6" />;
      case 'rewards_distributed':
        return <Gift className="w-6 h-6" />;
      case 'total_users':
        return <Users className="w-6 h-6" />;
      case 'total_deposits':
        return <TrendingUp className="w-6 h-6" />;
      case 'total_withdrawals':
        return <ArrowUpDown className="w-6 h-6" />;
      case 'average_apy':
        return <Coins className="w-6 h-6" />;
      default:
        return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getStatTitle = (statName: string) => {
    switch (statName) {
      case 'total_value_locked':
        return 'Total Value Locked';
      case 'active_stakers':
        return 'Stakers Actifs';
      case 'rewards_distributed':
        return 'Récompenses Distribuées';
      case 'total_users':
        return 'Utilisateurs Inscrits';
      case 'total_deposits':
        return 'Dépôts Totaux';
      case 'total_withdrawals':
        return 'Retraits Effectués';
      case 'average_apy':
        return 'APY Moyen';
      default:
        return statName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getStatColor = (statName: string) => {
    switch (statName) {
      case 'total_value_locked':
        return 'text-success';
      case 'active_stakers':
        return 'text-info';
      case 'rewards_distributed':
        return 'text-primary';
      case 'total_users':
        return 'text-warning';
      case 'total_deposits':
        return 'text-success';
      case 'total_withdrawals':
        return 'text-info';
      case 'average_apy':
        return 'text-primary';
      default:
        return 'text-primary';
    }
  };

  // Afficher les 4 statistiques principales
  const mainStats = stats.filter(stat => 
    ['total_value_locked', 'active_stakers', 'rewards_distributed', 'total_users'].includes(stat.stat_name)
  );

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="gradient-card border-primary/20">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-full mx-auto mb-4"></div>
              <div className="h-8 bg-primary/20 rounded mb-2"></div>
              <div className="h-4 bg-primary/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {mainStats.map((stat) => (
        <Card key={stat.stat_name} className="gradient-card border-primary/20 hover:shadow-neon transition-smooth">
          <CardContent className="p-6 text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${getStatColor(stat.stat_name)} bg-current/10`}>
              {getStatIcon(stat.stat_name)}
            </div>
            <div className={`text-2xl md:text-3xl font-bold mb-2 ${getStatColor(stat.stat_name)}`}>
              {formatValue(stat.stat_value, stat.display_format)}
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              {getStatTitle(stat.stat_name)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlatformStats;