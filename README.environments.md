# Environments & Secrets — BBO Microsite

Guidance for branch → environment mapping, secrets, and caching/CDN considerations.

## Branch → environment mapping

- `prod` → Production (Netlify)
- `main` → Staging / Pre-release (Netlify)
- `release/2a` → Phase 2a Preview (Netlify deploy with Phase 2a feature flags)
- `release/2b` → Phase 2b Preview (Netlify deploy with Phase 2b feature flags)
- `release/2c` → Phase 2c Preview (Netlify deploy with Phase 2c feature flags)
- PR branches → Netlify Preview (short-lived preview URLs)

## Environment variables & secrets

- Keep sample variables in [`.env.example`](.env.example:1). For local development use [`.env.local`](.env.local:1).
- Never commit `.env*` files to the repository.
- Store secrets in managed providers:
  - Netlify Environment Variables (Preview/Production scopes)
  - GitHub Actions secrets (CI)
  - Cloud secret managers (AWS SSM / Secrets Manager) for infra-level credentials
- Minimal example keys (defined in [`.env.example`](.env.example:1)):
  - NEXT_PUBLIC_DATAWAR_PDF_URL (DataWar game PDF download link)

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

-   Prefer ISR and tag revalidation for content freshness (`revalidate`, `revalidateTag`).
-   Static asset hosting (S3/CloudFront) should use long asset TTLs and short HTML TTLs.
-   When using CloudFront: automate invalidations for changed HTML paths or rely on versioned asset URLs.
-   Netlify previews and production provide built-in CDN behaviors — follow provider docs for cache controls.

## CI / Deploy notes

-   PR pipelines should run Quality Gates (typecheck, format, lint, tests, build) before preview deploy.
-   Merging to `main` triggers staging/pre-release deployment for final validation before production.
-   Merging to `prod` triggers production deploy (Netlify) after staging validation is complete.
-   **Release Branches**: Each `release/{phase}` branch (`2a`, `2b`, `2c`) has its own Netlify deployment:
    -   Merging a PR into a release branch triggers a Netlify deployment with custom feature flags configured for that specific phase.
    -   These deployments allow testing features in isolation before promoting to staging/production.
    -   Feature flags for each phase should be configured in Netlify environment variables for the corresponding deployment.
-   Use least-privilege service principals or deploy keys for automated S3/CloudFront operations. Keep these credentials in secret stores and the CI provider.

## Rollback & promotion

-   Use your hosting provider's rollback or "restore previous deployment" features for quick recovery (Netlify has deployment history).
-   For content/schema changes that are breaking, include migration scripts and dataset backups; document rollback steps in `/docs`.

## Monitoring & rotation

-   Rotate long-lived secrets periodically and after any suspected exposure.
-   Integrate basic monitoring/alerts for deploy failures and build-time errors (Sentry/Datadog or provider tooling).
