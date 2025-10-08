-- Replace existing function (schema-qualified, exact signature)
DROP FUNCTION IF EXISTS public.get_available_selfies_v2(uuid);

CREATE OR REPLACE FUNCTION public.get_available_selfies_v2(
  p_uuid UUID
)
RETURNS TABLE (
  next_at TIMESTAMPTZ,
  selfies_available INT
)
LANGUAGE plpgsql AS $func$
DECLARE
  v_user_id BIGINT;
  v_avatar_id BIGINT;
BEGIN
  -------------------------------------------------------------------
  -- Step 1: Find the user and their current avatar
  -------------------------------------------------------------------
  SELECT u.id, u.avatar_id
  INTO v_user_id, v_avatar_id
  FROM public.users u
  WHERE u.uuid = p_uuid;

  IF v_user_id IS NULL OR v_avatar_id IS NULL THEN
    RAISE NOTICE 'User % not found or has no avatar', p_uuid;
    RETURN;
  END IF;

  -------------------------------------------------------------------
  -- Step 2: Get next_at from user_cooldowns (for action = 'selfie')
  -------------------------------------------------------------------
  SELECT uc.next_at
  INTO next_at
  FROM public.user_cooldowns uc
  WHERE uc.user_id = v_user_id
    AND uc.action = 'selfie'
  LIMIT 1;

  -------------------------------------------------------------------
  -- Step 3: Count selfies available (not yet taken by user)
  -------------------------------------------------------------------
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
    );

END;
$func$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_available_selfies(uuid) TO authenticated;
