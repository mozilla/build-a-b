-- Replace existing function (schema-qualified, exact signature)
DROP FUNCTION IF EXISTS public.get_selfie_for_user_avatar(uuid);

CREATE OR REPLACE FUNCTION public.get_selfie_for_user_avatar(
  p_uuid UUID   -- User UUID
)
RETURNS TABLE (
  avatar_id BIGINT,
  asset TEXT
)
LANGUAGE plpgsql AS $func$
DECLARE
  v_user_id BIGINT;
  v_avatar_id BIGINT;
  v_selfie_id BIGINT;
  v_nindex INT;
BEGIN
  -------------------------------------------------------------------
  -- Step 1: Find user id and current avatar id from users table
  -------------------------------------------------------------------
  SELECT u.id, u.avatar_id
  INTO v_user_id, v_avatar_id
  FROM public.users u
  WHERE u.uuid = p_uuid;

  -- If user not found or has no current avatar, return nothing
  IF v_user_id IS NULL OR v_avatar_id IS NULL THEN
    RAISE NOTICE 'User with uuid % not found or missing avatar', p_uuid;
    RETURN;
  END IF;

  -------------------------------------------------------------------
  -- Step 2: Determine the selfie index (n_index) to fetch next
  -- Count how many selfies the user already has linked
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
    AND s.n_index = v_nindex
    AND s.status = 'published'
  LIMIT 1;

  -- If no selfie found, return nothing
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
    NOW() + INTERVAL '24 hours',
    NOW()
  )
  ON CONFLICT (user_id, action)
  DO UPDATE
  SET next_at = EXCLUDED.next_at,
      updated_at = EXCLUDED.updated_at;

  -------------------------------------------------------------------
  -- Step 6: Return selfie data (avatar_id and asset)
  -------------------------------------------------------------------
  RETURN QUERY
  SELECT s.avatar_id, s.asset
  FROM public.selfies s
  WHERE s.id = v_selfie_id;

END;
$func$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_selfie_for_user_avatar(uuid) TO authenticated;
