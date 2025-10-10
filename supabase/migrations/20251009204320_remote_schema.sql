set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_available_selfies(p_uuid uuid)
 RETURNS TABLE(next_at timestamp with time zone, selfies_available integer)
 LANGUAGE plpgsql
AS $function$
  DECLARE
    v_user_id BIGINT;
    v_avatar_id BIGINT;
  BEGIN
    -----------------------------------------------------
  --------------
    -- Step 1: Find the user and their current avatar
    -----------------------------------------------------
  --------------
    SELECT u.id, u.avatar_id
    INTO v_user_id, v_avatar_id
    FROM public.users u
    WHERE u.uuid = p_uuid;

    IF v_user_id IS NULL OR v_avatar_id IS NULL THEN
      RAISE NOTICE 'User % not found or has no avatar',
  p_uuid;
      RETURN;
    END IF;

    -----------------------------------------------------
  --------------
    -- Step 2: Get next_at from user_cooldowns (for action = 'selfie')
    -----------------------------------------------------
  --------------
    SELECT uc.next_at
    INTO next_at
    FROM public.user_cooldowns uc
    WHERE uc.user_id = v_user_id
      AND uc.action = 'selfie'
    LIMIT 1;

    -----------------------------------------------------
  --------------
    -- Step 3: Count selfies available (not yet taken by user)
    -----------------------------------------------------
  --------------
    RETURN QUERY
    SELECT
      next_at,
      COUNT(s.id)::INT AS selfies_available
    FROM public.selfies s
    WHERE s.avatar_id = v_avatar_id
      AND s.status = 'published'
      AND s.id NOT IN (
        SELECT us.selfie_id
        FROM public.user_selfies us
        WHERE us.user_id = v_user_id
      )
    LIMIT 1;

  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.get_user_avatar_by_uuid(user_uuid uuid)
 RETURNS TABLE(avatar_id bigint, asset_riding text, asset_instagram text, character_story text, first_name text, last_name text, selfies json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
  BEGIN
      RETURN QUERY
      SELECT
          a.id AS avatar_id,
          a.asset_riding,
          a.asset_instagram,
          a.character_story,
          a.first_name,
          a.last_name,
          COALESCE(
              json_agg(
                  json_build_object(
                      'id', s.id,
                      'asset', s.asset,
                      'created_at', s.created_at
                  )
                  ORDER BY s.created_at DESC
              ) FILTER (
                  WHERE s.id IS NOT NULL
                    AND s.status = 'published'
                    AND s.avatar_id = u.avatar_id
              ),
              '[]'::json
          ) AS selfies
      FROM public.users AS u
      INNER JOIN public.avatars AS a
          ON u.avatar_id = a.id
      LEFT JOIN public.user_selfies AS us
          ON us.user_id = u.id
      LEFT JOIN public.selfies AS s
          ON s.id = us.selfie_id
      WHERE u.uuid = user_uuid
      GROUP BY
          u.id,
          a.id,
          a.asset_riding,
          a.asset_instagram,
          a.character_story,
          a.first_name,
          a.last_name
      LIMIT 1;
  END;
  $function$
;


