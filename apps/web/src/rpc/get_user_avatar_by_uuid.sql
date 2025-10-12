CREATE OR REPLACE FUNCTION public.get_user_avatar_by_uuid(user_uuid uuid)
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
        COALESCE(
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
        ) AS selfies
    FROM public.users AS u
    INNER JOIN public.avatars AS a
        ON u.avatar_id = a.id
    LEFT JOIN public.user_selfies AS us
        ON us.user_id = u.id
    LEFT JOIN public.selfies AS s
        ON s.id = us.selfie_id
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
