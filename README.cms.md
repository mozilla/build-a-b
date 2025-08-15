# CMS (Sanity) — Mondo Lite

This document provides practical guidance for working with the Sanity Studio included in Mondo Lite.

## Studio location
The studio lives in the monorepo at:
- [`apps/studio`](apps/studio:1)

Schemas and content model files:
- [`apps/studio/schemaTypes`](apps/studio/schemaTypes:1)

## Studio responsibilities
- Provide editors with content editing UI for pages, posts, and shared blocks.
- Serve as the canonical content source (Sanity Content Lake) for the web app.
- Provide preview and draft workflows via webhooks and Next preview/draft mode.

## Content modeling guidelines
- Use stable, semantic schema names. Avoid renaming existing types — create migrations or aliases if needed.
- Prefer explicit field names and clearly documented projections.
- Keep validation in schema definitions (e.g., required fields, custom validators), not scattered UI logic.
- Use Portable Text for rich content; document custom marks and annotations in schema comments or docs folder.

## Queries & type safety
- Centralize GROQ queries used by the web app under `packages/web/src/lib/sanity/queries.ts`.
- Export TypeScript types or Zod validators for content shapes in `packages/web/src/lib/sanity/types.ts`.
- Favor narrow projections in GROQ (select only the fields required for rendering).

## Preview workflow
- Use Next draft mode + Sanity webhooks for content previews.
- Implement a secure preview handler on the web app that verifies webhook signatures or uses short-lived preview tokens.

## Commands (local development)
- Run Studio locally:
  - From root (if workspaces configured): `pnpm --filter ./apps/studio dev`
  - Or in the studio package: `pnpm dev` (see `apps/studio/package.json`)
- Validate schemas in CI:
  - `pnpm --filter ./apps/studio schema:validate` or `pnpm -F @apps/studio schema:validate`

## Schema changes & migrations
- Proposed schema changes must include:
  - PR with schema updates
  - Migration notes or scripts if data shape changes are breaking
  - CI pass of `schema:validate`
- Never mutate production dataset directly from local machines. Use scripted migrations and test against a copy of the dataset in staging.

## Content seeding
- Provide deterministic seed scripts for CI or dev where useful (not included by default). Keep seed scripts idempotent and documented.

## Default AI/integrator instructions (CMS)
- Propose schema changes via PR and include migration notes.
- Centralize queries and document projection shapes.
- Never add or change datasets in production without an owner-signed migration plan.

## Quick links
- Studio app: [`apps/studio`](apps/studio:1)
- Studio schemas: [`apps/studio/schemaTypes`](apps/studio/schemaTypes:1)
