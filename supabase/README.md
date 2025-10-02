# Core API + Queries (Supabase RPC or server routes)

## A. Generate Avatar (initial visit or “Create NEW avatar”)

**Input:** selected traits `{origin_story, core_drive, public_persona, power_play, legacy_plan}`  
**Steps:**

1.  Create user (if no cookie):
    
    ```sql
    INSERT INTO users DEFAULT VALUES RETURNING id, uuid;
    ```

2.  Pick a random matching avatar:
    
    ```sql
    WITH pool AS (
        SELECT id
        FROM avatars
        WHERE origin_story = $1
            AND core_drive = $2
            AND public_persona = $3
            AND power_play = $4
            AND legacy_plan = $5
    )
    SELECT id FROM pool ORDER BY random() LIMIT 1;
    ```

3.  Upsert the "current" link + history:
    
    ```sql
    -- Clear previous current row (if any)
    UPDATE user_avatars 
    SET is_current = false, removed_at = now() 
    WHERE user_id = $user_id AND is_current = true;

    -- Insert new history row
    INSERT INTO user_avatars (user_id, avatar_id, is_current) 
    VALUES ($user_id, $avatar_id, true) 
    ON CONFLICT (user_id, avatar_id) 
    DO UPDATE SET is_current = true, removed_at = NULL;

    -- Mirror onto users table for fast lookup
    UPDATE users 
    SET current_avatar_id = $avatar_id 
    WHERE id = $user_id;
    ```

**Output:** `{ uuid, current_avatar_id }` → set `uuid` cookie → redirect `/a/{uuid}`.

## B. Delete Avatar (Action 1a)

```sql
-- Mark history row as not current
UPDATE user_avatars 
SET is_current = false, removed_at = now() 
WHERE user_id = $user_id AND is_current = true;

-- Remove current pointer
UPDATE users 
SET current_avatar_id = NULL 
WHERE id = $user_id;
```

## C. Create NEW Avatar (Action 1b)

Same as **A** but the user already exists (cookie → load `users.id`). Re-run the random selection with given traits, then the upsert sequence.

* * *

# Playpen: Selfies

## Eligibility (“show the button?”)

-   Show **only if** there exists at least one selfie for the user's current avatar **and** it is released.
    
    ```sql
    SELECT EXISTS (
        SELECT 1
        FROM selfies s
        JOIN users u ON u.id = $user_id
        LEFT JOIN releases r ON r.id = s.release_id
        WHERE s.avatar_id = u.current_avatar_id
            AND (r.id IS NULL OR (r.is_active AND r.starts_at <= now()))
    ) AS can_take;
    ```

## Action 2a – Take a Selfie (first time)

1.  Fetch released selfies for current avatar, oldest first:
    
    ```sql
    WITH released AS (
        SELECT s.id
        FROM selfies s
        JOIN users u ON u.id = $user_id
        LEFT JOIN releases r ON r.id = s.release_id
        WHERE s.avatar_id = u.current_avatar_id
            AND (r.id IS NULL OR (r.is_active AND r.starts_at <= now()))
        ORDER BY s.created_at ASC, s.id ASC
    )
    SELECT id FROM released;
    ```

2.  Compute **Nth** index where `N = count(*) already taken by this user for this avatar`.
    
    ```sql
    SELECT COUNT(*) AS taken_count
    FROM users_selfies us
    JOIN selfies s ON s.id = us.selfie_id
    JOIN users u ON u.id = us.user_id
    WHERE us.user_id = $user_id
        AND s.avatar_id = u.current_avatar_id;
    ```

3.  Insert the new selfie (if N < released\_count):
    
    ```sql
    -- Pick Nth item (0-based) from the released list; in SQL:
    WITH released AS (
        ... same as above ...
    ),
    picked AS (
        SELECT id FROM released OFFSET $N LIMIT 1
    )
    INSERT INTO users_selfies (user_id, selfie_id)
    SELECT $user_id, id FROM picked;
    ```

Return the asset URL for UI gallery.

## Action 2b – Take ANOTHER selfie (guard against repeat)

-   Repeat the same query but **only insert** when `taken_count < released_count`. Otherwise, no-op and show a “next selfie not released yet” hint.
    

**Optional stricter guard**:

```sql
-- Unique (user_id, selfie_id) composite PK already protects duplicates.
-- Add this to ensure avatar consistency:
ALTER TABLE users_selfies 
ADD CONSTRAINT users_selfies_same_avatar CHECK (
    EXISTS (
        SELECT 1
        FROM selfies s
        JOIN users u ON u.id = user_id
        WHERE s.id = selfie_id
            AND (u.current_avatar_id IS NULL OR s.avatar_id = u.current_avatar_id)
    )
);
```

(You may skip the CHECK if you allow users to keep old selfies after switching avatars—which your flow does.)

* * *

# Playpen: TikTok (mirrors Selfies)

-   Replace `selfies` → `tiktoks`, `users_selfies` → `users_tiktoks`.
    
-   Same released gating and Nth-index selection logic.
    

* * *

# Redirect + Cookie Logic (frontend/server)

## Cookie

-   Name: `bb_uuid`
    
-   Value: `users.uuid`
    
-   Attributes: `Path=/; Max-Age=31536000; SameSite=Lax; Secure`.
    

## Middleware (pseudo-code)

```ts
// Pseudo Next.js/Astro middleware
const uuid = getCookie('bb_uuid');

if (pathname === '/' || pathname === '/index') {
    if (uuid) return redirect(`/a/${uuid}`);
    return next(); // show default homepage
}

if (pathname.startsWith('/a/')) {
    const urlUuid = pathname.split('/')[2];
    
    // If no cookie but URL has a valid UUID and user clicks "Save",
    // set cookie client-side after the action; otherwise we still render.
    return next();
}
```

## /a/{uuid} page loader

```ts
// fetch user by uuid
const user = await db.users.findByUUID(uuid);

// Decide which bento to render
if (user?.current_avatar_id) {
    const avatar = await db.avatars.getById(user.current_avatar_id);
    return renderAvatarBento({ user, avatar });
} else {
    return renderGenerateBento({ user }); // still on /a/{uuid}
}
```

## “Save” action

-   When clicked (QR / copy link modal), set `bb_uuid` cookie if absent:
    
    ```ts
    if (!getCookie('bb_uuid')) setCookie('bb_uuid', uuid, cookieOptions);
    ```

* * *

# Endpoints (suggested)

-   `POST /api/users` → create user, returns `{uuid}` (used when no cookie).
    
-   `POST /api/avatars/assign` → body: `{ uuid, traits }` → selects random avatar, updates `users.current_avatar_id` and `user_avatars`.
    
-   `DELETE /api/avatars/current` → body: `{ uuid }` → clears current avatar.
    
-   `POST /api/selfies/take` → body: `{ uuid }` → performs Nth logic, returns `{assetUrl}` or `{status: "no_more_released"}`.
    
-   `POST /api/tiktoks/take` → body: `{ uuid }` → mirrors selfies.
    

(If you prefer Supabase SQL/RPC, wrap each as a `SECURITY DEFINER` function and call via `supabase.rpc`.)

* * *

# Indexes you’ll want

```sql
-- Fast trait filters for avatar selection
CREATE INDEX avatars_traits_idx ON avatars (origin_story, core_drive, public_persona, power_play, legacy_plan);

-- Fast lookups
CREATE INDEX users_uuid_idx ON users (uuid);
CREATE INDEX selfies_avatar_created_idx ON selfies (avatar_id, created_at);
CREATE INDEX tiktoks_avatar_created_idx ON tiktoks (avatar_id, created_at);

-- Release gating
CREATE INDEX releases_active_time_idx ON releases (kind, is_active, starts_at);
```

* * *

# Supabase Security (RLS sketch)

-   **users**: readable by UUID cookie only; writes via RPC.
    

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own by uuid" ON users 
FOR SELECT USING (uuid::text = current_setting('app.bb_uuid', true));

-- You can set `app.bb_uuid` in a PostgREST pre-request or pass via RPC.
```

-   Prefer **RPC functions** (`SECURITY DEFINER`) to execute the write sequences for avatar assignment, deletion, and selfie/tiktok taking. They bypass RLS internally while verifying inputs.
    

* * *

# Edge cases handled

-   User with cookie but **no current avatar** → Generate bento on `/a/{uuid}`.
    
-   No released selfie yet for that avatar → button hidden (eligibility check).
    
-   Switching avatars **does not** break prior selfies: `users_selfies` stays historical.
    
-   Random selection among multiple avatars with identical traits.
    
-   Idempotency: composite PKs for users\_selfies/users\_tiktoks prevent duplicates; “Nth” logic ensures correct progression with release cadence.
    

* * *

If you want, I can package the above into:

1.  SQL migrations for Supabase (`supabase/migrations/*.sql`)
    
2.  A set of Postgres RPC functions for each action (assign, delete, take\_selfie, take\_tiktok)
    
3.  Minimal TypeScript client calls (Supabase JS) for each endpoint
    

Just say the word and I’ll drop those in.






# DBML (complete, normalized)

```dbml
//////////////////////////////////////////////////////
// Core entities
//////////////////////////////////////////////////////

Table avatars {
  id                  bigint       [pk]
  name                text
  combination_key     text
  seed                text
  created_at          timestamptz  [default: `now()`]
  origin_story        text
  core_drive          text
  public_persona      text
  power_play          text
  legacy_plan         text
  first_name          text
  last_name           text
  pose                text
  uploaded_at         timestamptz  [default: `now()`]
  parsed_successfully bool         [default: false]
  updated_at          timestamptz  [default: `now()`]
  character_story     text
  meta_data           jsonb        [default: `{}`]
  asset_standing      text
  asset_riding        text
  asset_instagram     text
  asset_landscape     text
  asset_stories       text
  body_type           text
  hair_color          text
  hair_style          text
  skin_tone           text
}

Table users {
  id                 bigint      [pk]
  created_at         timestamptz [default: `now()`]
  uuid               uuid        [default: `gen_random_uuid()`]
  current_avatar_id  bigint      [ref: > avatars.id] // nullable
}

//////////////////////////////////////////////////////
// Avatar history per user (tracks changes)
//////////////////////////////////////////////////////

Table user_avatars {
  id          bigint       [pk]
  user_id     bigint       [ref: > users.id]
  avatar_id   bigint       [ref: > avatars.id]
  assigned_at timestamptz  [default: `now()`]
  removed_at  timestamptz
  is_current  bool         [default: false]

  Indexes {
    (user_id, avatar_id) [unique]  // prevent duplicates
  }
}

//////////////////////////////////////////////////////
// Media (pre-generated, belongs to Avatars)
//////////////////////////////////////////////////////

Table selfies {
  id          bigint       [pk]
  avatar_id   bigint       [ref: > avatars.id]
  asset       text                     // URL/path in storage
  created_at  timestamptz  [default: `now()`]
  release_id  bigint                   // optional: link to staged releases
}

Table tiktoks {
  id          bigint       [pk]
  avatar_id   bigint       [ref: > avatars.id]
  asset       text
  created_at  timestamptz  [default: `now()`]
  release_id  bigint
}

//////////////////////////////////////////////////////
// User ↔ Media (many-to-many consumption log)
//////////////////////////////////////////////////////

Table users_selfies {
  user_id     bigint       [ref: > users.id]
  selfie_id   bigint       [ref: > selfies.id]
  taken_at    timestamptz  [default: `now()`]

  Indexes {
    (user_id, selfie_id) [pk]  // composite PK
    (user_id)
  }
}

Table users_tiktoks {
  user_id     bigint       [ref: > users.id]
  tiktok_id   bigint       [ref: > tiktoks.id]
  taken_at    timestamptz  [default: `now()`]

  Indexes {
    (user_id, tiktok_id) [pk]
    (user_id)
  }
}

//////////////////////////////////////////////////////
// Cadence / feature gating (optional but useful)
//////////////////////////////////////////////////////

Table releases {
  id          bigint       [pk]
  kind        text                      // 'selfie' | 'tiktok'
  name        text
  starts_at   timestamptz               // when this content is “released”
  is_active   bool         [default: true]
}
```

