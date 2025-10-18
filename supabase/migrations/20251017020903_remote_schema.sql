drop function if exists "public"."get_selfie_for_user_avatar"(p_uuid uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_selfie_for_user_avatar(p_uuid uuid)
 RETURNS TABLE(asset text, id bigint, created_at timestamp with time zone, n_index smallint)
 LANGUAGE plpgsql
AS $function$
DECLARE
  v_user_id   BIGINT;
  v_avatar_id BIGINT;
  v_selfie_id BIGINT;
  v_nindex    INT;
BEGIN
  -------------------------------------------------------------------
  -- Step 1: Find user id and current avatar id from users table
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
  -- Step 2: Determine the selfie index (n_index) to fetch next
  -------------------------------------------------------------------
  SELECT COUNT(*) + 1
  INTO v_nindex
  FROM public.user_selfies us
  WHERE us.user_id = v_user_id;

  RAISE NOTICE 'Next selfie index for user % is %', v_user_id, v_nindex;

  -------------------------------------------------------------------
  -- Step 3: Find the published selfie with that n_index for this avatar
  -------------------------------------------------------------------
  SELECT s.id
  INTO v_selfie_id
  FROM public.selfies s
  WHERE s.avatar_id = v_avatar_id
    AND s.n_index   = v_nindex
    AND s.status    = 'published'
  LIMIT 1;

  IF v_selfie_id IS NULL THEN
    RAISE NOTICE 'No selfie found for avatar id % and index %', v_avatar_id, v_nindex;
    RETURN;
  END IF;

  -------------------------------------------------------------------
  -- Step 4: Link user and selfie in user_selfies table
  -------------------------------------------------------------------
  INSERT INTO public.user_selfies (user_id, selfie_id)
  VALUES (v_user_id, v_selfie_id)
  ON CONFLICT DO NOTHING;

  -------------------------------------------------------------------
  -- Step 5: Upsert cooldown record for the user
  -------------------------------------------------------------------
  INSERT INTO public.user_cooldowns (user_id, action, next_at, updated_at)
  VALUES (
    v_user_id,
    'selfie',
    NOW() + INTERVAL '2 minutes',
    NOW()
  )
  ON CONFLICT (user_id, action)
  DO UPDATE
  SET next_at   = EXCLUDED.next_at,
      updated_at = EXCLUDED.updated_at;

  -------------------------------------------------------------------
  -- Step 6: Return selfie data (asset, id, created_at, n_index)
  -------------------------------------------------------------------
  RETURN QUERY
  SELECT s.asset, s.id, s.created_at, s.n_index
  FROM public.selfies s
  WHERE s.id = v_selfie_id;

END;
$function$
;


