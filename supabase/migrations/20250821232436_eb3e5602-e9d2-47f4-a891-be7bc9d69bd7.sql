-- Corriger la politique RLS pour permettre la lecture publique des messages de chat
DROP POLICY IF EXISTS "Users can view chat messages securely" ON public.chat_messages;

CREATE POLICY "Chat messages are publicly readable" 
ON public.chat_messages 
FOR SELECT 
USING (true);