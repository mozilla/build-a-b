set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.remove_avatar_by_user(p_uuid uuid)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
  DECLARE
    v_user_id BIGINT;
  BEGIN
    -- Find user id from uuid
    SELECT u.id INTO v_user_id
    FROM users u
    WHERE u.uuid = p_uuid;

    -- If user doesn't exist, just exit quietly
    IF v_user_id IS NULL THEN
      RAISE NOTICE 'User with uuid % not found', p_uuid;
      RETURN;
    END IF;

    -- 1️⃣ Update user: clear avatar_id
    UPDATE users
    SET avatar_id = NULL
    WHERE uuid = p_uuid;

    -- 2️⃣ Update related avatars: set all is_current to false
    UPDATE user_avatars
    SET is_current = FALSE
    WHERE user_id = v_user_id;

  END;
  $function$
;


