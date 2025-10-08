-- Replace existing function (schema-qualified, exact signature)
DROP FUNCTION IF EXISTS public.get_user_avatar_by_uuid(uuid);

CREATE OR REPLACE FUNCTION public.get_user_avatar_by_uuid(user_uuid UUID)
RETURNS TABLE (
    avatar_id BIGINT,
    asset_riding TEXT,
    asset_instagram TEXT,
    character_story TEXT,
    first_name TEXT,
    last_name TEXT,
    selfies JSON
)
SET search_path = ''
-- lock down search_path
LANGUAGE plpgsql AS $func$
BEGIN
  RETURN QUERY
  SELECT
    a.id AS avatar_id,
    a.asset_riding,
    a.asset_instagram,
    a.character_story,
    a.first_name,
    a.last_name,
    -----------------------------------------------------------------
    -- Build ordered JSON array of selfies for this user's current avatar
    -----------------------------------------------------------------
    COALESCE(
      (
        SELECT json_agg(
                 json_build_object(
                   'id', s.id,
                   'asset', s.asset,
                   'created_at', s.created_at,
                   'n_index', s.n_index
                 )
                 ORDER BY s.n_index ASC
               )
        FROM public.selfies AS s
        WHERE s.avatar_id = a.id
          AND s.status = 'published'
      ),
      '[]'::json
    ) AS selfies
  FROM public.users AS u
  INNER JOIN public.avatars AS a
    ON u.current_avatar_id = a.id
  WHERE u.uuid = user_uuid
  GROUP BY
    u.id,
    a.id,
    a.asset_riding,
    a.asset_instagram,
    a.character_story,
    a.first_name,
    a.last_name;
END;
$func$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_avatar_by_uuid(uuid) TO authenticated;
