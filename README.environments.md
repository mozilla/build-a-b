# Environments & Secrets — Mondo Lite

Guidance for branch → environment mapping, secrets, and caching/CDN considerations.

## Branch → environment mapping

- `main` → Production (Vercel or per‑client production)
- PR branches → Vercel Preview (short‑lived preview URLs)
- Long‑lived integration/staging branches → Staging (optional, if configured)

## Environment variables & secrets

- Keep sample variables in [`.env.example`](.env.example:1). For local development use [`.env.local`](.env.local:1).
- Never commit `.env*` files to the repository.
- Store secrets in managed providers:
  - Vercel Environment Variables (Preview/Production scopes)
  - GitHub Actions secrets (CI)
  - Cloud secret managers (AWS SSM / Secrets Manager) for infra-level credentials
- Minimal example keys (defined in [`.env.example`](.env.example:1)):
  - NEXT_PUBLIC_SANITY_PROJECT_ID
  - NEXT_PUBLIC_SANITY_DATASET
  - SANITY_WRITE_TOKEN
  - NEXTAUTH_SECRET
  - GITHUB_ID / GITHUB_SECRET
  - NEXT_PUBLIC_LD_CLIENT_ID (LaunchDarkly)

## Local development

1. Copy sample env:
   ```bash
   cp .env.example .env.local
   ```
2. Fill required values, avoid using production write tokens locally.
3. Install and run:
   ```bash
   pnpm install
   pnpm dev
   ```

## Caching & CDN

- Prefer ISR and tag revalidation for content freshness (`revalidate`, `revalidateTag`).
- Static asset hosting (S3/CloudFront) should use long asset TTLs and short HTML TTLs.
- When using CloudFront: automate invalidations for changed HTML paths or rely on versioned asset URLs.
- Vercel previews and production provide built-in CDN behaviors — follow provider docs for cache controls.

## CI / Deploy notes

- PR pipelines should run Quality Gates (typecheck, format, lint, tests, schema validate, build) before preview deploy.
- Merging to `main` should only occur after all checks pass; main triggers production deploy (Vercel or configured workflow).
- Use least‑privilege service principals or deploy keys for automated S3/CloudFront operations. Keep these credentials in secret stores and the CI provider.

## Rollback & promotion

- Use your hosting provider's rollback or "restore previous deployment" features for quick recovery (Vercel has deployment history).
- For content/schema changes that are breaking, include migration scripts and dataset backups; document rollback steps in `/docs`.

## Monitoring & rotation

- Rotate long‑lived secrets periodically and after any suspected exposure.
- Integrate basic monitoring/alerts for deploy failures and build-time errors (Sentry/Datadog or provider tooling).

## Quick links

- Studio package: [`packages/studio`](packages/studio:1)
- Web app: [`packages/web`](packages/web:1)
- Env example: [`.env.example`](.env.example:1)
