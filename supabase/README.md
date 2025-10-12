# Core API + Queries (Supabase RPC or server routes)

This README is aligned with the latest database schema you provided (users, avatars, user_avatars, selfies/tiktoks with `n_index` and pipeline `status`, junction tables with `id` PKs, and `user_cooldowns` with `id` PK).  
It documents **traits & random avatar assignment**, **24h Selfies** / **72h TikToks** cooldowns, **N-indexed slots**, and the **pipeline**.

> ℹ️ First-selfie launch time is assumed to be handled by application config (e.g., `SELFIE_FIRST_RELEASE_AT`) rather than a DB `releases` table.

---

## A. Generate Avatar (initial visit or “Create NEW avatar”)

**Input (two modes):**
- **Traits mode:** `{origin_story, core_drive, public_persona, power_play, legacy_plan}`
- **Random mode:** `{}` (or `mode: "random"`) → pick any avatar

**Steps:**

1. Create user (if no cookie):
    ```sql
    INSERT INTO users DEFAULT VALUES
    RETURNING id, uuid;
    ```

2. Pick a matching or random avatar:
    ```sql
    -- TRAITS MODE
    WITH pool AS (
      SELECT id
      FROM avatars
      WHERE origin_story = $1
        AND core_drive   = $2
        AND public_persona = $3
        AND power_play   = $4
        AND legacy_plan  = $5
    )
    SELECT id FROM pool ORDER BY random() LIMIT 1;

    -- RANDOM MODE
    SELECT id FROM avatars ORDER BY random() LIMIT 1;
    ```

3. Upsert the "current" link + history:
    ```sql
    -- Clear previous current row (if any)
    UPDATE user_avatars
    SET is_current = false, removed_at = now()
    WHERE user_id = $user_id AND is_current = true;

    -- Insert new history row
    INSERT INTO user_avatars (user_id, avatar_id, is_current)
    VALUES ($user_id, $avatar_id, true);

    -- Mirror onto users table for fast lookup
    UPDATE users
    SET avatar_id = $avatar_id
    WHERE id = $user_id;
    ```

**Output:** `{ uuid, avatar_id }` → set `uuid` cookie → redirect `/a/{uuid}`.

---

## B. Delete Avatar

```sql
-- Mark history row as not current
UPDATE user_avatars
SET is_current = false, removed_at = now()
WHERE user_id = $user_id AND is_current = true;

-- Remove current pointer
UPDATE users
SET avatar_id = NULL
WHERE id = $user_id;
```

---

## C. Create NEW Avatar (repeat generate)

Same as **A** but the user already exists (cookie → load `users.id`). Run **traits** or **random** selection, then upsert current + history.

---

# Playpen: Selfies — 24h Cooldown + N-Indexed Slots

### Overview
- First selfie (index **0**) unlock is controlled by app config `SELFIE_FIRST_RELEASE_AT` (UTC).
- Each user has a **24-hour cooldown** between selfie generations, stored in `user_cooldowns` with `action='selfie'`.
- Selfies per avatar are **slots**: `(avatar_id, n_index)` where `n_index = 0,1,2,...`. The slot must be `status='published'` to grant.
- After granting slot **N**, **enqueue** slot **N+1** if it does not exist yet (create with `status='queued'` for the worker pipeline).

## Eligibility (“show the button?”)
```sql
-- 1) Require current avatar
SELECT avatar_id IS NOT NULL
FROM users WHERE id = $user_id;

-- 2) Compute the user's next index N for their current avatar
WITH u AS (
  SELECT id AS user_id, avatar_id
  FROM users WHERE id = $user_id
)
SELECT COALESCE(
  (SELECT COUNT(*) FROM users_selfies us
     JOIN selfies s ON s.id = us.selfie_id
   WHERE us.user_id = (SELECT user_id FROM u)
     AND s.avatar_id = (SELECT avatar_id FROM u)), 0
) AS next_n;

-- 3) First selfie time gate (in app code, not SQL):
-- now() >= to_timestamp(:SELFIE_FIRST_RELEASE_AT)

-- 4) Cooldown gate for N>0
SELECT COALESCE(
  (SELECT next_at FROM user_cooldowns
   WHERE user_id=$user_id AND action='selfie'
   ORDER BY created_at DESC LIMIT 1),
  to_timestamp(0)
) <= now() AS cooldown_ok;

-- 5) Next slot must be published
WITH u AS (
  SELECT avatar_id FROM users WHERE id = $user_id
),
n AS ( /* compute next_n as above */ SELECT $N AS next_n )
SELECT EXISTS (
  SELECT 1 FROM selfies s
  WHERE s.avatar_id = (SELECT avatar_id FROM u)
    AND s.n_index   = (SELECT next_n FROM n)
    AND s.status    = 'published'
) AS slot_ready;
```

## Generate Selfie (server RPC/transaction)
```sql
-- inside a transaction
WITH u AS (
  SELECT id AS user_id, avatar_id
  FROM users WHERE id = $user_id
),
n AS (
  SELECT /* compute */ $N::int AS next_n
),
slot AS (
  SELECT id FROM selfies
  WHERE avatar_id = (SELECT avatar_id FROM u)
    AND n_index   = (SELECT next_n FROM n)
    AND status    = 'published'
  FOR UPDATE
)
-- Prevent duplicates in users_selfies (schema uses id PK)
INSERT INTO users_selfies (user_id, selfie_id)
SELECT (SELECT user_id FROM u), id FROM slot
WHERE NOT EXISTS (
  SELECT 1 FROM users_selfies us
  WHERE us.user_id = (SELECT user_id FROM u)
    AND us.selfie_id = (SELECT id FROM slot)
);

-- Upsert cooldown to now + 24h
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_cooldowns WHERE user_id=$user_id AND action='selfie') THEN
    UPDATE user_cooldowns
    SET next_at = now() + interval '24 hours', updated_at = now()
    WHERE user_id=$user_id AND action='selfie';
  ELSE
    INSERT INTO user_cooldowns (user_id, action, next_at)
    VALUES ($user_id, 'selfie', now() + interval '24 hours');
  END IF;
END $$;

-- Enqueue N+1 if missing
INSERT INTO selfies (avatar_id, n_index, status)
SELECT (SELECT avatar_id FROM u), (SELECT next_n FROM n) + 1, 'queued'
WHERE NOT EXISTS (
  SELECT 1 FROM selfies
  WHERE avatar_id = (SELECT avatar_id FROM u)
    AND n_index   = (SELECT next_n FROM n) + 1
);
```

**Response:** `{ assetUrl, n_indexGranted, next_available_at }`

---

# Playpen: TikTok — 72h Cooldown + N-Indexed Slots

TikTok mirrors the Selfie flow but uses a **72-hour** per-user cooldown (`action='tiktok'`). If you have a first-release time, handle it in app config (e.g., `TIKTOK_FIRST_RELEASE_AT`).

## Generate TikTok (server RPC/transaction)
```sql
-- inside a transaction (identical shape to selfies)
WITH u AS (
  SELECT id AS user_id, avatar_id
  FROM users WHERE id = $user_id
),
n AS (
  SELECT /* compute */ $N::int AS next_n
),
slot AS (
  SELECT id FROM tiktoks
  WHERE avatar_id = (SELECT avatar_id FROM u)
    AND n_index   = (SELECT next_n FROM n)
    AND status    = 'published'
  FOR UPDATE
)
INSERT INTO users_tiktoks (user_id, tiktok_id)
SELECT (SELECT user_id FROM u), id FROM slot
WHERE NOT EXISTS (
  SELECT 1 FROM users_tiktoks ut
  WHERE ut.user_id = (SELECT user_id FROM u)
    AND ut.tiktok_id = (SELECT id FROM slot)
);

-- Cooldown to now + 72h
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM user_cooldowns WHERE user_id=$user_id AND action='tiktok') THEN
    UPDATE user_cooldowns
    SET next_at = now() + interval '72 hours', updated_at = now()
    WHERE user_id=$user_id AND action='tiktok';
  ELSE
    INSERT INTO user_cooldowns (user_id, action, next_at)
    VALUES ($user_id, 'tiktok', now() + interval '72 hours');
  END IF;
END $$;

-- Enqueue N+1 if missing
INSERT INTO tiktoks (avatar_id, n_index, status)
SELECT (SELECT avatar_id FROM u), (SELECT next_n FROM n) + 1, 'queued'
WHERE NOT EXISTS (
  SELECT 1 FROM tiktoks
  WHERE avatar_id = (SELECT avatar_id FROM u)
    AND n_index   = (SELECT next_n FROM n) + 1
);
```

**Response:** `{ assetUrl, n_indexGranted, next_available_at }`

---

# Endpoints (suggested)

- `POST /api/users` → create user, returns `{uuid}` (used when no cookie).  
- `POST /api/avatars/assign` → `{ uuid, traits? }` → traits or random; updates `users.avatar_id` + history.  
- `DELETE /api/avatars/current` → `{ uuid }` → clears current avatar.  
- `GET /api/selfies/eligibility` → `{ uuid }` → `{ canGenerate, reason, nextIndex, slotReady, nextAvailableAt }`.  
- `POST /api/selfies/generate` → `{ uuid }` → grants N, sets +24h, enqueues N+1.  
- `GET /api/tiktoks/eligibility` / `POST /api/tiktoks/generate` → mirror selfies with 72h cooldown.

(Or implement as Supabase RPCs with `SECURITY DEFINER`.)

---

# Indexes & Constraints (recommended)

> Your current schema uses surrogate `id` PKs for junctions and cooldowns. To guarantee idempotency and fast lookups, add the following:

```sql
-- Deduplicate log rows (optional but recommended)
CREATE UNIQUE INDEX IF NOT EXISTS users_selfies_unique
  ON users_selfies (user_id, selfie_id);

CREATE UNIQUE INDEX IF NOT EXISTS users_tiktoks_unique
  ON users_tiktoks (user_id, tiktok_id);

-- One cooldown row per (user, action)
CREATE UNIQUE INDEX IF NOT EXISTS user_cooldowns_unique
  ON user_cooldowns (user_id, action);

-- Fast reads
CREATE INDEX IF NOT EXISTS users_uuid_idx ON users (uuid);
CREATE INDEX IF NOT EXISTS selfies_avatar_n_idx ON selfies (avatar_id, n_index);
CREATE INDEX IF NOT EXISTS selfies_status_idx   ON selfies (status);
CREATE INDEX IF NOT EXISTS tiktoks_avatar_n_idx ON tiktoks (avatar_id, n_index);
CREATE INDEX IF NOT EXISTS tiktoks_status_idx   ON tiktoks (status);
CREATE INDEX IF NOT EXISTS users_selfies_user_idx ON users_selfies (user_id);
CREATE INDEX IF NOT EXISTS users_tiktoks_user_idx ON users_tiktoks (user_id);
```

---

# Supabase Security (RLS sketch)

- **users**: readable by UUID cookie only; writes via RPC.
  ```sql
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "read own by uuid" ON users
  FOR SELECT USING (uuid::text = current_setting('app.bb_uuid', true));
  ```
- **RPCs**: implement avatar assignment/deletion and media generation as `SECURITY DEFINER` functions; validate `uuid` → `user_id` inside the function; set `app.bb_uuid` if needed.

---

# Edge cases handled

- Cookie but **no current avatar** → Generate bento on `/a/{uuid}`.  
- **Prelaunch** (selfie/tiktok 0): gated by app config datetime.  
- **Cooldown**: button shows countdown to `user_cooldowns.next_at`.  
- **Preparing**: next slot exists but not `published` → disabled with “Preparing…”.  
- Switching avatars does not remove past media.  
- Idempotency via unique indices + `WHERE NOT EXISTS` inserts.  
- Random selection when traits omitted.


* * *

# DBML (complete, normalized)

https://dbdiagram.io/d/MozBBO-DB-Schema-68cb6eab5779bb7265fe1f7a

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
  uuid               uuid        [default: `gen_random_uuid()`]
  avatar_id  bigint      [ref: > avatars.id] // nullable
  created_at         timestamptz [default: `now()`]
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
  created_at  timestamptz  [default: `now()`]
}

//////////////////////////////////////////////////////
// Selfies: N-indexed slots with pipeline state
//////////////////////////////////////////////////////

Table selfies {
  id           bigint       [pk]
  avatar_id    bigint       [ref: > avatars.id]
  n_index      int
  asset        text
  status       text         [default: 'published'] // 'queued' | 'generating' | 'moderating' | 'failed' | 'published'
  created_at   timestamptz  [default: `now()`]
  moderated_at timestamptz
  meta         jsonb        [default: `{}`]
  user_id      bigint       [note: 'Deprecated']
}

//////////////////////////////////////////////////////
// Videos: N-indexed slots with pipeline state
//////////////////////////////////////////////////////

Table videos {
  id           bigint       [pk]
  avatar_id    bigint       [ref: > avatars.id]
  n_index      int
  asset        text
  status       text         [default: 'published'] // 'queued' | 'generating' | 'moderating' | 'failed' | 'published'
  created_at   timestamptz  [default: `now()`]
  moderated_at timestamptz
  meta         jsonb        [default: `{}`]
}

//////////////////////////////////////////////////////
// User ↔ Media (many-to-many consumption log)
//////////////////////////////////////////////////////

Table user_selfies {
  id          bigint       [pk]
  user_id     bigint       [ref: > users.id]
  selfie_id   bigint       [ref: > selfies.id]
  created_at  timestamptz  [default: `now()`]
}

Table user_videos {
  id          bigint       [pk]
  user_id     bigint       [ref: > users.id]
  video_id   bigint       [ref: > videos.id]
  created_at  timestamptz  [default: `now()`]
}

//////////////////////////////////////////////////////
// Cooldowns (per user / per action)
//////////////////////////////////////////////////////

Table user_cooldowns {
  id         bigint       [pk]
  user_id    bigint       [ref: > users.id]
  action     text         // 'selfie' | 'video'
  next_at    timestamptz
  updated_at timestamptz  [default: `now()`]
  created_at timestamptz  [default: `now()`]
}

```

# Migrations

## Pulling Schema from Remote

To pull the database schema (tables, functions, policies, etc.) from your remote Supabase project as migration files:

1. **Set the database password** (required for authentication):
   ```bash
   export SUPABASE_DB_PASSWORD="your-password-here"
   ```

   You can find this password in `apps/web/.env` under `SUPABASE_DB_PASSWORD`.

2. **Link to your remote project** (one time only):
   ```bash
   supabase link --project-ref oqqutatvbdlpumixjiwg
   ```

3. **Pull the schema**:
   ```bash
   supabase db pull
   ```

This will generate migration files in `supabase/migrations/` that can be committed to git as a backup of your database structure.

> **Note:** `supabase db pull` only pulls the schema (DDL), not the data. To add seed data, manually edit `supabase/seed.sql` or use `supabase db dump --data-only > supabase/seed.sql`.

## Running Migrations

To apply migration files to a database (useful for disaster recovery or setting up a new environment):

1. **Set the database password**:
   ```bash
   export SUPABASE_DB_PASSWORD="your-password-here"
   ```

2. **Link to your target project** (if not already linked):
   ```bash
   supabase link --project-ref <your-project-ref>
   ```

3. **Push migrations to remote**:
   ```bash
   supabase db push
   ```

   This will apply all pending migration files from `supabase/migrations/` to your remote database.

4. **Optional: Apply seed data**:
   ```bash
   supabase db seed
   ```

   This runs the `supabase/seed.sql` file to populate initial data.

### Local Development

To run migrations locally (requires Docker):

1. **Start local Supabase**:
   ```bash
   supabase start
   ```

2. **Migrations are applied automatically** when starting. To manually reset and reapply:
   ```bash
   supabase db reset
   ```

   This drops the local database, reruns all migrations, and applies seed data.

