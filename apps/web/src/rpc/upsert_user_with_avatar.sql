CREATE OR REPLACE FUNCTION public.upsert_user_with_avatar (
  p_uuid TEXT, -- uuid can be passed as text (to allow empty string) 
  p_avatar_id INT8 
) 
RETURNS TABLE (
  avatar_id INT8,
  created_at TIMESTAMPTZ,
  id BIGINT,
  uuid UUID
)
LANGUAGE plpgsql AS $func$
DECLARE
  v_uid BIGINT;
  v_uuid UUID; 
BEGIN
  -- Normalize uuid: if p_uuid is empty or null, keep it null
  IF p_uuid IS NULL OR length(trim(p_uuid)) = 0 THEN
    v_uuid := NULL;
  ELSE
    v_uuid := p_uuid::UUID;
  END IF;
  
  -- Try to find user by uuid only if a valid one was provided
  IF v_uuid IS NOT NULL THEN
    SELECT u.id INTO v_uid
    FROM users u
    WHERE u.uuid = v_uuid; 
  END IF;
  
  IF v_uid IS NULL THEN
    -- If no user found, insert a new user
    INSERT INTO users (avatar_id, created_at)
    VALUES (p_avatar_id, NOW())
    RETURNING users.id, users.uuid INTO v_uid, v_uuid;
  ELSE
    -- If user exists, update current avatar
    UPDATE users
    SET avatar_id = p_avatar_id
    WHERE users.uuid = v_uuid
    RETURNING users.id, users.uuid INTO v_uid, v_uuid;
  END IF;
  
  -- Reset is_current flag for all previous avatars of this user
  UPDATE user_avatars
  SET is_current = FALSE
  WHERE user_id = v_uid;
  
  -- Insert new avatar as the current one
  INSERT INTO user_avatars (user_id, avatar_id, is_current)
  VALUES (v_uid, p_avatar_id, TRUE);
  
  -- Return data from users table
  RETURN QUERY
  SELECT u.avatar_id,
         u.created_at,
         u.id,
         u.uuid 
  FROM users u
  WHERE u.id = v_uid;
  
END;
$func$;
