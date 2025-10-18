drop function if exists "public"."get_selfie_for_user_avatar"(p_uuid uuid);

alter table "public"."users" add column "easter_egg_id" smallint;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.store_easter_egg(p_uuid uuid, p_easter_egg_id integer)
 RETURNS TABLE(avatar_id bigint, asset text, id bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
  DECLARE
    v_user_id BIGINT;
    v_avatar_id BIGINT;
    v_existing_easter_egg_id INT;
  BEGIN
    -- Get user_id, avatar_id, and existing easter_egg_id from UUID
    SELECT u.id, u.avatar_id, u.easter_egg_id
    INTO v_user_id, v_avatar_id, v_existing_easter_egg_id
    FROM public.users u
    WHERE u.uuid = p_uuid;

    -- If user not found, return nothing
    IF v_user_id IS NULL OR v_avatar_id IS NULL THEN
      RAISE NOTICE 'User with uuid % not found or missing avatar', p_uuid;
      RETURN;
    END IF;

    -- Only update if easter_egg_id is not already set
    IF v_existing_easter_egg_id IS NULL THEN
      UPDATE public.users
      SET easter_egg_id = p_easter_egg_id
      WHERE users.id = v_user_id;

      v_existing_easter_egg_id := p_easter_egg_id;
    END IF;

    -- Return the easter egg as a "selfie" with the card asset path
    -- Use explicit values instead of selecting from table to avoid  ambiguity
    avatar_id := v_avatar_id;
    asset := '/assets/images/data-war/cards/' || v_existing_easter_egg_id ||
   '.webp';
    id := -1;
    created_at := NOW();

    RETURN NEXT;

  END;
  $function$
;

CREATE OR REPLACE FUNCTION public.get_selfie_for_user_avatar(p_uuid uuid)
 RETURNS TABLE(avatar_id bigint, asset text, id bigint, created_at timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
  DECLARE
    v_user_id BIGINT;
    v_avatar_id BIGINT;
    v_selfie_id BIGINT;
  BEGIN
    ----------------------------------------------------
  ---------------
    -- Step 1: Find user id and current avatar id from users table
    ----------------------------------------------------
  ---------------
    SELECT u.id, u.avatar_id
    INTO v_user_id, v_avatar_id
    FROM public.users u
    WHERE u.uuid = p_uuid;

    -- If user not found or has no current avatar, return nothing
    IF v_user_id IS NULL OR v_avatar_id IS NULL THEN
      RAISE NOTICE 'User with uuid % not found or 
  missing avatar', p_uuid;
      RETURN;
    END IF;

    ----------------------------------------------------
  ---------------
    -- Step 2: Select the next selfie for current avatar that user hasn't taken yet
    ----------------------------------------------------
  ---------------
    SELECT s.id
    INTO v_selfie_id
    FROM public.selfies s
    WHERE s.avatar_id = v_avatar_id
      AND s.status = 'published'
      AND s.id NOT IN (
        SELECT us.selfie_id
        FROM public.user_selfies us
        WHERE us.user_id = v_user_id
      )
    ORDER BY s.created_at ASC
    LIMIT 1;

    -- If no selfie found, return nothing
    IF v_selfie_id IS NULL THEN
      RAISE NOTICE 'No new selfie found for avatar id 
  %', v_avatar_id;
      RETURN;
    END IF;

    ----------------------------------------------------
  ---------------
    -- Step 3: Link user and selfie in user_selfies table
    ----------------------------------------------------
  ---------------
    INSERT INTO public.user_selfies (user_id, selfie_id)
    VALUES (v_user_id, v_selfie_id)
    ON CONFLICT DO NOTHING;

    ----------------------------------------------------
  ---------------
    -- Step 4: Upsert cooldown record for the user
    ----------------------------------------------------
  ---------------
    INSERT INTO public.user_cooldowns (user_id, action,
  next_at, updated_at)
    VALUES (
      v_user_id,
      'selfie',
      NOW() + INTERVAL '2 minutes',
      NOW()
    )
    ON CONFLICT (user_id, action)
    DO UPDATE
    SET next_at = EXCLUDED.next_at,
        updated_at = EXCLUDED.updated_at;

    ----------------------------------------------------
  ---------------
    -- Step 5: Return selfie data (avatar_id, asset, id, created_at)
    ----------------------------------------------------
  ---------------
    RETURN QUERY
    SELECT s.avatar_id, s.asset, s.id, s.created_at
    FROM public.selfies s
    WHERE s.id = v_selfie_id;

  END;
  $function$
;

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

    -- Get regular selfies (ORDER BY created_at ASC so oldest is first, newest before easter egg)
    SELECT COALESCE(
      json_agg(
        json_build_object(
          'id', s.id,
          'asset', s.asset,
          'created_at', s.created_at
        )
        ORDER BY s.created_at ASC
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

    -- If easter egg exists, create the easter egg object and append it to the END
    IF v_easter_egg_id IS NOT NULL THEN
      v_easter_egg := json_build_object(
        'id', -1,
        'asset', '/assets/images/data-war/cards/' || v_easter_egg_id || '.webp',
        'created_at', NOW()
      );

      -- Append easter egg to the END of selfies array
      v_user_selfies := (v_user_selfies::jsonb || jsonb_build_array(v_easter_egg))::json;
    END IF;

    -- Return the complete avatar data with selfies (easter egg is last if present)
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

CREATE OR REPLACE FUNCTION public.remove_avatar_by_user(p_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
  DECLARE
    v_user_id BIGINT;
  BEGIN
    -------------------------------------------------------------------
    -- Step 1: Find user id from uuid
    -------------------------------------------------------------------
    SELECT u.id INTO v_user_id
    FROM users u
    WHERE u.uuid = p_uuid;

    -- If user doesn't exist, just exit quietly
    IF v_user_id IS NULL THEN
      RAISE NOTICE 'User with uuid % not found', p_uuid;
      RETURN;
    END IF;

    -------------------------------------------------------------------
    -- Step 2: Clear current avatar and easter egg from users table
    -------------------------------------------------------------------
    UPDATE users
    SET avatar_id = NULL,
        easter_egg_id = NULL
    WHERE uuid = p_uuid;

    -------------------------------------------------------------------
    -- Step 3: Update user_avatars — mark previous current avatar as removed
    -------------------------------------------------------------------
    UPDATE user_avatars
    SET
      is_current = FALSE,
      removed_at = NOW()
    WHERE user_id = v_user_id
      AND is_current = TRUE;

    -------------------------------------------------------------------
    -- Step 4: Reset user_cooldowns — clear next_at for this user
    -------------------------------------------------------------------
    UPDATE user_cooldowns
    SET next_at = NULL
    WHERE user_id = v_user_id
      AND action = 'selfie';

  END;
  $function$
;


