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
  v_last_selfie_created_at TIMESTAMPTZ;
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
  -- Step 2: Determine the next selfie to assign
  -- Find the latest selfie (by created_at) already linked to this user
  -------------------------------------------------------------------
  SELECT MAX(s.created_at)
  INTO v_last_selfie_created_at
  FROM public.user_selfies us
  INNER JOIN public.selfies s ON s.id = us.selfie_id
  WHERE us.user_id = v_user_id
    AND s.avatar_id = v_avatar_id;

  -------------------------------------------------------------------
  -- Step 3: Select the next selfie published after the latest one linked
  -------------------------------------------------------------------
  SELECT s.id
  INTO v_selfie_id
  FROM public.selfies s
  WHERE s.avatar_id = v_avatar_id
    AND s.status = 'published'
    AND (
      v_last_selfie_created_at IS NULL
      OR s.created_at > v_last_selfie_created_at
    )
  ORDER BY s.created_at ASC
  LIMIT 1;

  -- If no selfie found, return nothing
  IF v_selfie_id IS NULL THEN
    RAISE NOTICE 'No new selfie found for avatar id % (last linked at %)', v_avatar_id, v_last_selfie_created_at;
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
