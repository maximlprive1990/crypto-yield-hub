import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Send, Users, User, Edit2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  created_at: string;
  is_own_message?: boolean;
}

const LiveChat = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [nickname, setNickname] = useState('');
  const [tempNickname, setTempNickname] = useState('');
  const [showNicknameDialog, setShowNicknameDialog] = useState(false);
  const [onlineUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger le nickname depuis le localStorage
  useEffect(() => {
    if (user) {
      const savedNickname = localStorage.getItem(`chat_nickname_${user.id}`);
      if (savedNickname) {
        setNickname(savedNickname);
      } else {
        setShowNicknameDialog(true);
      }
    }
  }, [user]);

  // Charger les messages existants via la fonction sécurisée
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_public_chat_messages');

        if (error) throw error;
        setMessages(data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des messages:', error);
      }
    };

    loadMessages();
  }, []);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          // Recharger les messages via la fonction sécurisée pour maintenir la sécurité
          try {
            const { data, error } = await supabase.rpc('get_public_chat_messages');
            if (error) throw error;
            setMessages(data || []);
          } catch (error) {
            console.error('Erreur lors du rechargement des messages:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const saveNickname = () => {
    if (!tempNickname.trim()) {
      toast({
        title: 'Erreur',
        description: 'Le surnom ne peut pas être vide',
        variant: 'destructive',
      });
      return;
    }

    if (tempNickname.trim().length < 2) {
      toast({
        title: 'Erreur',
        description: 'Le surnom doit contenir au moins 2 caractères',
        variant: 'destructive',
      });
      return;
    }

    if (tempNickname.trim().length > 20) {
      toast({
        title: 'Erreur',
        description: 'Le surnom ne peut pas dépasser 20 caractères',
        variant: 'destructive',
      });
      return;
    }

    const cleanNickname = tempNickname.trim();
    setNickname(cleanNickname);
    localStorage.setItem(`chat_nickname_${user?.id}`, cleanNickname);
    setShowNicknameDialog(false);
    setTempNickname('');
    
    toast({
      title: 'Surnom défini',
      description: `Votre surnom "${cleanNickname}" a été enregistré`,
    });
  };

  const changeNickname = () => {
    setTempNickname(nickname);
    setShowNicknameDialog(true);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || isLoading || !nickname) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          username: nickname,
          message: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
      inputRef.current?.focus();
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du message:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNicknameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveNickname();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserColor = (messageIndex: number) => {
    const colors = [
      'text-red-400',
      'text-blue-400',
      'text-green-400',
      'text-yellow-400',
      'text-purple-400',
      'text-pink-400',
      'text-indigo-400',
      'text-orange-400'
    ];
    const index = messageIndex % colors.length;
    return colors[index];
  };

  if (!user) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <p className="text-muted-foreground">Connectez-vous pour accéder au chat</p>
      </Card>
    );
  }

  return (
    <>
      {/* Dialog pour choisir le nickname */}
      <Dialog open={showNicknameDialog} onOpenChange={setShowNicknameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {nickname ? 'Modifier votre surnom' : 'Choisir votre surnom'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {nickname 
                ? 'Entrez un nouveau surnom pour le chat :' 
                : 'Choisissez un surnom pour pouvoir participer au chat :'
              }
            </p>
            <div className="space-y-2">
              <Input
                value={tempNickname}
                onChange={(e) => setTempNickname(e.target.value)}
                onKeyPress={handleNicknameKeyPress}
                placeholder="Votre surnom (2-20 caractères)"
                maxLength={20}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                {tempNickname.length}/20 caractères
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNicknameDialog(false)} disabled={!nickname}>
                Annuler
              </Button>
              <Button onClick={saveNickname} disabled={!tempNickname.trim()}>
                {nickname ? 'Modifier' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="w-full h-96 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">💬</span>
            Chat en Direct
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <Users className="w-4 h-4" />
              <span>{onlineUsers} en ligne</span>
            </div>
          </CardTitle>
          {nickname && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Surnom:</span>
              <span className="font-medium text-primary">{nickname}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={changeNickname}
                className="h-6 w-6 p-0"
              >
                <Edit2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col gap-3 p-4 pt-0">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p>Aucun message pour le moment.</p>
                  <p className="text-sm">Soyez le premier à dire bonjour ! 👋</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwnMessage = message.is_own_message;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        {!isOwnMessage && (
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm font-medium ${getUserColor(index)}`}>
                              {message.username}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(message.created_at)}
                            </span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.message}
                        </p>
                        {isOwnMessage && (
                          <div className="text-xs opacity-70 mt-1 text-right">
                            {formatTime(message.created_at)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {!nickname ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <p className="text-muted-foreground text-center">
                Vous devez choisir un surnom pour pouvoir envoyer des messages.
              </p>
              <Button onClick={() => setShowNicknameDialog(true)} className="w-fit">
                <User className="w-4 h-4 mr-2" />
                Choisir un surnom
              </Button>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  disabled={isLoading}
                  maxLength={500}
                  className="flex-1"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isLoading}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground text-center">
                Appuyez sur Entrée pour envoyer • {newMessage.length}/500
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default LiveChat;