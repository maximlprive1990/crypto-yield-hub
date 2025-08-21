-- Créer la table des messages de chat
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Créer les policies pour le chat (tous les utilisateurs peuvent lire et écrire)
CREATE POLICY "Tous les utilisateurs peuvent voir les messages" 
ON public.chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Les utilisateurs connectés peuvent envoyer des messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Activer le realtime pour les messages de chat
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;