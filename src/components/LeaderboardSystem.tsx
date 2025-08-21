import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Medal, Trophy, TrendingUp, Users, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  score: number;
  rank_position: number;
  profiles: {
    username: string;
  };
}

const LeaderboardSystem = () => {
  const { user } = useAuth();
  const [leaderboards, setLeaderboards] = useState<{[key: string]: LeaderboardEntry[]}>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mining_weekly');

  useEffect(() => {
    fetchLeaderboards();
  }, []);

  const fetchLeaderboards = async () => {
    const leaderboardTypes = ['mining_weekly', 'mining_monthly', 'staking_total', 'experience', 'referrals'];
    const results: {[key: string]: LeaderboardEntry[]} = {};

    for (const type of leaderboardTypes) {
      const { data, error } = await supabase
        .from('leaderboard_entries')
        .select(`
          *,
          profiles(username)
        `)
        .eq('leaderboard_type', type)
        .order('rank_position', { ascending: true })
        .limit(10);

      if (!error && data) {
        results[type] = data;
      }
    }

    setLeaderboards(results);
    setLoading(false);
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Trophy className="h-6 w-6 text-orange-500" />;
      default: return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankStyle = (position: number) => {
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 2: return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 3: return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50';
      default: return 'bg-secondary/30 border-border';
    }
  };

  const getLeaderboardTitle = (type: string) => {
    switch (type) {
      case 'mining_weekly': return 'Mining Hebdomadaire';
      case 'mining_monthly': return 'Mining Mensuel';
      case 'staking_total': return 'Staking Total';
      case 'experience': return 'Expérience';
      case 'referrals': return 'Parrainages';
      default: return type;
    }
  };

  const getLeaderboardIcon = (type: string) => {
    switch (type) {
      case 'mining_weekly':
      case 'mining_monthly': return <Zap className="h-5 w-5" />;
      case 'staking_total': return <TrendingUp className="h-5 w-5" />;
      case 'experience': return <Trophy className="h-5 w-5" />;
      case 'referrals': return <Users className="h-5 w-5" />;
      default: return <Trophy className="h-5 w-5" />;
    }
  };

  const formatScore = (score: number, type: string) => {
    switch (type) {
      case 'mining_weekly':
      case 'mining_monthly':
      case 'staking_total':
        return `${score.toLocaleString()} coins`;
      case 'experience':
        return `${score.toLocaleString()} XP`;
      case 'referrals':
        return `${score} référés`;
      default:
        return score.toLocaleString();
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Chargement des classements...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🏆 Classements
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez les meilleurs performers et montez dans le classement !
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="mining_weekly" className="text-xs">Mining 7j</TabsTrigger>
            <TabsTrigger value="mining_monthly" className="text-xs">Mining 30j</TabsTrigger>
            <TabsTrigger value="staking_total" className="text-xs">Staking</TabsTrigger>
            <TabsTrigger value="experience" className="text-xs">Expérience</TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs">Parrainages</TabsTrigger>
          </TabsList>

          {Object.entries(leaderboards).map(([type, entries]) => (
            <TabsContent key={type} value={type} className="mt-6">
              <Card className="gradient-card border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {getLeaderboardIcon(type)}
                    <div>
                      <CardTitle>{getLeaderboardTitle(type)}</CardTitle>
                      <CardDescription>
                        Top 10 des meilleurs performers
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {entries.length === 0 ? (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-xl font-semibold mb-2">Aucun classement disponible</h3>
                      <p className="text-muted-foreground">
                        Soyez le premier à apparaître dans ce classement !
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {entries.map((entry, index) => {
                        const isCurrentUser = user?.id === entry.user_id;
                        
                        return (
                          <div
                            key={entry.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                              getRankStyle(entry.rank_position || index + 1)
                            } ${isCurrentUser ? 'ring-2 ring-primary' : ''}`}
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex items-center justify-center w-12">
                                {getRankIcon(entry.rank_position || index + 1)}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">
                                    {entry.profiles?.username || 'Utilisateur anonyme'}
                                  </span>
                                  {isCurrentUser && (
                                    <Badge variant="secondary" className="text-xs">
                                      Vous
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Position #{entry.rank_position || index + 1}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-primary">
                                {formatScore(entry.score, type)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* User's Current Positions */}
        {user && (
          <Card className="gradient-card border-primary/20 mt-8">
            <CardHeader>
              <CardTitle>Vos Positions</CardTitle>
              <CardDescription>
                Votre classement actuel dans chaque catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(leaderboards).map(([type, entries]) => {
                  const userEntry = entries.find(e => e.user_id === user.id);
                  
                  return (
                    <div key={type} className="text-center p-4 bg-secondary/30 rounded-lg">
                      <div className="flex justify-center mb-2">
                        {getLeaderboardIcon(type)}
                      </div>
                      <div className="text-sm font-medium mb-1">
                        {getLeaderboardTitle(type)}
                      </div>
                      {userEntry ? (
                        <div>
                          <div className="text-lg font-bold text-primary">
                            #{userEntry.rank_position}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatScore(userEntry.score, type)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          Non classé
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default LeaderboardSystem;