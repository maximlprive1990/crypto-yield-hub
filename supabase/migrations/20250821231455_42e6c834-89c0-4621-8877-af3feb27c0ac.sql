-- Créer une fonction sécurisée pour insérer des messages dans le live chat
CREATE OR REPLACE FUNCTION public.send_chat_message(
  p_username text,
  p_message text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_message_id uuid;
  v_cleaned_username text;
  v_cleaned_message text;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur non authentifié'
    );
  END IF;

  -- Nettoyer et valider le nom d'utilisateur
  v_cleaned_username := trim(p_username);
  IF length(v_cleaned_username) < 2 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Le nom d''utilisateur doit contenir au moins 2 caractères'
    );
  END IF;
  
  IF length(v_cleaned_username) > 20 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Le nom d''utilisateur ne peut pas dépasser 20 caractères'
    );
  END IF;

  -- Nettoyer et valider le message
  v_cleaned_message := trim(p_message);
  IF length(v_cleaned_message) = 0 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Le message ne peut pas être vide'
    );
  END IF;
  
  IF length(v_cleaned_message) > 500 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Le message ne peut pas dépasser 500 caractères'
    );
  END IF;

  -- Vérifier le rate limiting (max 1 message par seconde par utilisateur)
  IF EXISTS (
    SELECT 1 FROM public.chat_messages 
    WHERE user_id = auth.uid() 
    AND created_at > now() - interval '1 second'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Vous envoyez des messages trop rapidement. Attendez une seconde.'
    );
  END IF;

  -- Insérer le message
  INSERT INTO public.chat_messages (user_id, username, message)
  VALUES (auth.uid(), v_cleaned_username, v_cleaned_message)
  RETURNING id INTO v_message_id;

  -- Nettoyer les anciens messages (garder seulement les 100 plus récents)
  DELETE FROM public.chat_messages 
  WHERE id NOT IN (
    SELECT id FROM public.chat_messages 
    ORDER BY created_at DESC 
    LIMIT 100
  );

  RETURN json_build_object(
    'success', true,
    'message_id', v_message_id,
    'message', 'Message envoyé avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de l''envoi du message: ' || SQLERRM
    );
END;
$$;

-- Créer une fonction pour obtenir les statistiques du chat
CREATE OR REPLACE FUNCTION public.get_chat_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $$
  SELECT json_build_object(
    'total_messages', COUNT(*),
    'active_users_today', COUNT(DISTINCT user_id) FILTER (WHERE created_at >= CURRENT_DATE),
    'messages_today', COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE),
    'last_message_time', MAX(created_at)
  )
  FROM public.chat_messages;
$$;

-- Créer une fonction pour modérer le chat (supprimer un message)
CREATE OR REPLACE FUNCTION public.delete_chat_message(p_message_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_message_user_id uuid;
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Utilisateur non authentifié'
    );
  END IF;

  -- Récupérer l'ID de l'utilisateur du message
  SELECT user_id INTO v_message_user_id
  FROM public.chat_messages
  WHERE id = p_message_id;

  -- Vérifier que le message existe
  IF v_message_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Message non trouvé'
    );
  END IF;

  -- Vérifier que l'utilisateur peut supprimer ce message (seulement ses propres messages)
  IF v_message_user_id != auth.uid() THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Vous ne pouvez supprimer que vos propres messages'
    );
  END IF;

  -- Supprimer le message
  DELETE FROM public.chat_messages WHERE id = p_message_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Message supprimé avec succès'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Erreur lors de la suppression: ' || SQLERRM
    );
END;
$$;

-- Accorder les permissions aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.send_chat_message(text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chat_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_chat_message(uuid) TO authenticated;