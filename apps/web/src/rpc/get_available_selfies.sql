CREATE OR REPLACE FUNCTION public.get_available_selfies(p_uuid uuid)
 RETURNS TABLE(next_n bigint, next_at timestamp with time zone)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  DECLARE
    v_user_id   BIGINT;
    v_avatar_id BIGINT;
  BEGIN
    -------------------------------------------------------------------
    -- Step 1: Get user_id and avatar_id from UUID
    -------------------------------------------------------------------
    SELECT u.id, u.avatar_id
    INTO v_user_id, v_avatar_id
    FROM public.users u
    WHERE u.uuid = p_uuid;

    IF v_user_id IS NULL OR v_avatar_id IS NULL THEN
      RAISE NOTICE 'User with uuid % not found or missing avatar', p_uuid;
      RETURN;
    END IF;

    -------------------------------------------------------------------
    -- Step 2: Return count of user selfies and next_at from cooldowns
    -------------------------------------------------------------------
    RETURN QUERY
    SELECT
      COALESCE(
        (SELECT COUNT(*)
         FROM public.user_selfies us
         JOIN public.selfies s ON s.id = us.selfie_id
         WHERE us.user_id = v_user_id
           AND s.avatar_id = v_avatar_id), 0
      )::BIGINT AS next_n,
      uc.next_at AS next_at
    FROM public.user_cooldowns uc
    WHERE uc.user_id = v_user_id;

  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.get_avatar_standing_asset_by_user_uuid(user_uuid uuid)
 RETURNS TABLE(user_id bigint, avatar_id bigint, asset_standing text)
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        u.id as user_id,
        u.avatar_id,
        a.asset_standing
    FROM public.users AS u
    INNER JOIN public.avatars AS a ON u.avatar_id = a.id
    WHERE u.uuid = user_uuid;
END;
$function$;