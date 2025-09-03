import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Gift, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalAuth as useAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';

interface Mission {
  id: string;
  title: string;
  description: string;
  mission_type: string;
  target_amount: number;
  reward_type: string;
  reward_amount: number;
  duration_hours: number;
}

interface UserMission {
  id: string;
  mission_id: string;
  current_progress: number;
  target_amount: number;
  is_completed: boolean;
  is_claimed: boolean;
  expires_at: string;
  missions: Mission;
}

const MissionsSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMissions();
    }
  }, [user]);

  const fetchMissions = async () => {
    if (!user) return;

    // Fetch user's active missions
    const { data: userMissionsData, error: userError } = await supabase
      .from('user_missions')
      .select(`
        *,
        missions (*)
      `)
      .eq('user_id', user.id)
      .eq('is_claimed', false)
      .order('started_at', { ascending: false });

    if (!userError && userMissionsData) {
      setUserMissions(userMissionsData);
    }

    // Fetch available missions not yet started today
    const { data: availableData, error: availableError } = await supabase
      .from('missions')
      .select('*')
      .eq('is_active', true);

    if (!availableError && availableData) {
      // Filter out missions already started today
      const todayMissionIds = userMissionsData?.map(um => um.mission_id) || [];
      const filteredMissions = availableData.filter(m => !todayMissionIds.includes(m.id));
      setAvailableMissions(filteredMissions);
    }

    setLoading(false);
  };

  const startMission = async (missionId: string) => {
    if (!user) return;

    const mission = availableMissions.find(m => m.id === missionId);
    if (!mission) return;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + mission.duration_hours);

    const { error } = await supabase
      .from('user_missions')
      .insert({
        user_id: user.id,
        mission_id: missionId,
        target_amount: mission.target_amount,
        expires_at: expiresAt.toISOString()
      });

    if (!error) {
      toast({
        title: "Mission commencée !",
        description: `Vous avez ${mission.duration_hours}h pour compléter cette mission.`,
      });
      fetchMissions();
    }
  };

  const claimReward = async (userMissionId: string, mission: Mission) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_missions')
      .update({ is_claimed: true })
      .eq('id', userMissionId);

    if (!error) {
      // Update user profile with rewards
      if (mission.reward_type === 'deadspot') {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('deadspot_tokens')
          .eq('user_id', user.id)
          .single();
        
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              deadspot_tokens: (currentProfile.deadspot_tokens || 0) + mission.reward_amount 
            })
            .eq('user_id', user.id);
        }
      } else if (mission.reward_type === 'experience') {
        const { data: currentProfile } = await supabase
          .from('profiles')
          .select('experience_points')
          .eq('user_id', user.id)
          .single();
        
        if (currentProfile) {
          await supabase
            .from('profiles')
            .update({ 
              experience_points: (currentProfile.experience_points || 0) + mission.reward_amount 
            })
            .eq('user_id', user.id);
        }
      }

      toast({
        title: "Récompense réclamée !",
        description: `Vous avez reçu ${mission.reward_amount} ${mission.reward_type === 'deadspot' ? 'DeadSpot coins' : 'points XP'} !`,
      });
      fetchMissions();
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getMissionTypeIcon = (type: string) => {
    switch (type) {
      case 'mining': return '⛏️';
      case 'staking': return '🏦';
      case 'referral': return '👥';
      case 'login': return '📅';
      case 'experience': return '⭐';
      default: return '🎯';
    }
  };

  const getRarityColor = (rewardAmount: number) => {
    if (rewardAmount >= 1000) return 'text-yellow-500';
    if (rewardAmount >= 500) return 'text-purple-500';
    if (rewardAmount >= 100) return 'text-blue-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Chargement des missions...</div>
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
            🎯 Missions & Quêtes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Complétez des missions quotidiennes pour gagner des récompenses exclusives !
          </p>
        </div>

        {/* Active Missions */}
        {userMissions.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-6">Missions Actives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userMissions.map((userMission) => {
                const mission = userMission.missions;
                const progress = getProgressPercentage(userMission.current_progress, userMission.target_amount);
                const isExpired = new Date(userMission.expires_at) < new Date();
                const timeLeft = Math.max(0, new Date(userMission.expires_at).getTime() - new Date().getTime());
                const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutesLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

                return (
                  <Card key={userMission.id} className="gradient-card border-primary/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getMissionTypeIcon(mission.mission_type)}</span>
                          <div>
                            <CardTitle className="text-lg">{mission.title}</CardTitle>
                            <CardDescription>{mission.description}</CardDescription>
                          </div>
                        </div>
                        {userMission.is_completed ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Terminée
                          </Badge>
                        ) : isExpired ? (
                          <Badge variant="destructive">Expirée</Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Clock className="h-4 w-4 mr-1" />
                            {hoursLeft}h {minutesLeft}m
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progression</span>
                          <span>{userMission.current_progress} / {userMission.target_amount}</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Gift className="h-5 w-5 text-primary" />
                          <span className={`font-semibold ${getRarityColor(mission.reward_amount)}`}>
                            {mission.reward_amount} {mission.reward_type === 'deadspot' ? 'DeadSpot' : 'XP'}
                          </span>
                        </div>
                        
                        {userMission.is_completed && !userMission.is_claimed && (
                          <Button 
                            onClick={() => claimReward(userMission.id, mission)}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Réclamer
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Available Missions */}
        {availableMissions.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold mb-6">Missions Disponibles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableMissions.map((mission) => (
                <Card key={mission.id} className="gradient-card border-primary/20 hover-scale">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getMissionTypeIcon(mission.mission_type)}</span>
                      <div>
                        <CardTitle className="text-lg">{mission.title}</CardTitle>
                        <CardDescription>{mission.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm">Objectif: {mission.target_amount}</span>
                      </div>
                      <Badge variant="outline">
                        {mission.duration_hours}h
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-primary" />
                        <span className={`font-semibold ${getRarityColor(mission.reward_amount)}`}>
                          {mission.reward_amount} {mission.reward_type === 'deadspot' ? 'DeadSpot' : 'XP'}
                        </span>
                      </div>
                      
                      <Button 
                        onClick={() => startMission(mission.id)}
                        size="sm"
                      >
                        Commencer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {userMissions.length === 0 && availableMissions.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucune mission disponible</h3>
              <p className="text-muted-foreground">
                Revenez plus tard pour découvrir de nouvelles missions !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default MissionsSystem;