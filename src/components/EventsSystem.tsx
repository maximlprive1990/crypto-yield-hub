import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Sparkles, Zap, Gift, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const EventsSystem = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    // Set up real-time subscription for events
    const subscription = supabase
      .channel('events_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'events' }, 
        () => fetchEvents()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    if (!error && data) {
      setEvents(data);
    }
    setLoading(false);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'double_xp': return <Sparkles className="h-6 w-6 text-purple-500" />;
      case 'bonus_mining': return <Zap className="h-6 w-6 text-yellow-500" />;
      case 'special_crypto': return <TrendingUp className="h-6 w-6 text-green-500" />;
      case 'increased_drops': return <Gift className="h-6 w-6 text-blue-500" />;
      default: return <Calendar className="h-6 w-6 text-primary" />;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'double_xp': return 'Double XP';
      case 'bonus_mining': return 'Bonus Mining';
      case 'special_crypto': return 'Crypto Spécial';
      case 'increased_drops': return 'Drops Augmentés';
      default: return eventType;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'double_xp': return 'border-purple-500/50 bg-purple-500/10';
      case 'bonus_mining': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'special_crypto': return 'border-green-500/50 bg-green-500/10';
      case 'increased_drops': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-primary/50 bg-primary/10';
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) return { expired: true };

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes, expired: false };
  };

  const getEventProgress = (startDate: string, endDate: string) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end - start;
    const elapsed = now - start;
    return (elapsed / total) * 100;
  };

  const isEventActive = (startDate: string, endDate: string) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return now >= start && now <= end;
  };

  const isEventUpcoming = (startDate: string) => {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();
    
    return now < start;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Chargement des événements...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const activeEvents = events.filter(event => isEventActive(event.start_date, event.end_date));
  const upcomingEvents = events.filter(event => isEventUpcoming(event.start_date));

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            🎉 Événements Temporaires
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profitez d'événements spéciaux pour maximiser vos gains et débloquer des bonus exclusifs !
          </p>
        </div>

        {/* Active Events */}
        {activeEvents.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Événements Actifs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeEvents.map((event) => {
                const timeRemaining = getTimeRemaining(event.end_date);
                const progress = getEventProgress(event.start_date, event.end_date);

                return (
                  <Card 
                    key={event.id} 
                    className={`gradient-card transition-all duration-300 hover-scale ${getEventColor(event.event_type)} animate-pulse border-2`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getEventIcon(event.event_type)}
                          <div>
                            <CardTitle className="text-xl">{event.title}</CardTitle>
                            <CardDescription>{event.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-500 text-white animate-bounce">
                          ACTIF
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Multiplicateur:</span>
                          <Badge variant="secondary" className="text-lg">
                            ×{event.multiplier}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Type:</span>
                          <Badge variant="outline">
                            {getEventTypeLabel(event.event_type)}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Temps restant:</span>
                          {!timeRemaining.expired ? (
                            <div className="text-sm text-primary font-semibold">
                              {timeRemaining.days > 0 && `${timeRemaining.days}j `}
                              {timeRemaining.hours}h {timeRemaining.minutes}m
                            </div>
                          ) : (
                            <span className="text-sm text-red-500">Expiré</span>
                          )}
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Se termine le {new Date(event.end_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="h-6 w-6 text-muted-foreground" />
              Événements À Venir
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card 
                  key={event.id} 
                  className={`gradient-card transition-all duration-300 hover-scale ${getEventColor(event.event_type)} opacity-75`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {getEventIcon(event.event_type)}
                      <div>
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Multiplicateur:</span>
                        <Badge variant="secondary">
                          ×{event.multiplier}
                        </Badge>
                      </div>
                      <Badge variant="outline" className="text-orange-500 border-orange-500">
                        Bientôt
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4" />
                        Commence le {new Date(event.start_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Se termine le {new Date(event.end_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Events */}
        {activeEvents.length === 0 && upcomingEvents.length === 0 && (
          <Card className="text-center p-8">
            <CardContent>
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Aucun événement en cours</h3>
              <p className="text-muted-foreground">
                Revenez plus tard pour découvrir de nouveaux événements passionnants !
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default EventsSystem;