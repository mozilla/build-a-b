CREATE OR REPLACE FUNCTION public.remove_avatar_by_user(
  p_uuid UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $func$
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
  -- Step 2: Clear current avatar from users table
  -------------------------------------------------------------------
  UPDATE users
  SET avatar_id = NULL
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
$func$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.remove_avatar_by_user(uuid) TO authenticated;