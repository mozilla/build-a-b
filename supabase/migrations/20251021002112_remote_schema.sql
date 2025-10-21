set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_avatar_by_uuid(user_uuid uuid)
 RETURNS TABLE(avatar_id bigint, asset_riding text, asset_instagram text, character_story text, first_name text, last_name text, selfies json)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
    DECLARE
      v_easter_egg_id INT;
      v_user_selfies JSON;
      v_easter_egg JSON;
    BEGIN
      -- Get the easter_egg_id for this user
      SELECT u.easter_egg_id
      INTO v_easter_egg_id
      FROM public.users AS u
      WHERE u.uuid = user_uuid;

      -- Get regular selfies (ORDER BY created_at DESC so newest is first)
      SELECT COALESCE(
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
      )
      INTO v_user_selfies
      FROM public.users AS u
      LEFT JOIN public.user_selfies AS us ON us.user_id = u.id
      LEFT JOIN public.selfies AS s ON s.id = us.selfie_id
      WHERE u.uuid = user_uuid
      GROUP BY u.id;

      -- If easter egg exists, create the easter egg object and prepend it to the BEGINNING
      IF v_easter_egg_id IS NOT NULL THEN
        v_easter_egg := json_build_object(
          'id', -1,
          'asset', '/assets/images/data-war/cards/' || v_easter_egg_id || '.webp',
          'created_at', NOW()
        );

        -- Prepend easter egg to the BEGINNING of selfies array
        v_user_selfies := (jsonb_build_array(v_easter_egg) || v_user_selfies::jsonb)::json;
      END IF;

      -- Return the complete avatar data with selfies (easter egg is first if present)
      RETURN QUERY
      SELECT
        a.id AS avatar_id,
        a.asset_riding,
        a.asset_instagram,
        a.character_story,
        a.first_name,
        a.last_name,
        v_user_selfies AS selfies
      FROM public.users AS u
      INNER JOIN public.avatars AS a ON u.avatar_id = a.id
      WHERE u.uuid = user_uuid
      LIMIT 1;
    END;
    $function$
;


