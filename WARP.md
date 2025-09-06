# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Mondo Lite** is a Next.js 15+ TypeScript monorepo starter kit featuring HeroUI components, Tailwind CSS v4, and Sanity CMS. This is a white-label boilerplate designed for rapid client site deployment with consistent quality gates and architectural patterns.

## Common Development Commands

### Core Workflow
```bash
# Install dependencies
pnpm install

# Start all services (web + studio)
pnpm dev

# Build all apps
pnpm build

# Production start (web only)
pnpm start
```

### Web App Development (`apps/web`)
```bash
# Development with Turbopack
pnpm --filter ./apps/web dev
# or: pnpm dev:web

# Build for production
pnpm --filter ./apps/web build

# Start production server
pnpm --filter ./apps/web start

# Run tests
pnpm --filter ./apps/web test

# Run tests in watch mode
pnpm --filter ./apps/web test:watch

# Lint and format
pnpm --filter ./apps/web lint
pnpm --filter ./apps/web format
```

### Sanity Studio Development (`apps/studio`)
```bash
# Start studio locally
pnpm --filter ./apps/studio dev
# or: pnpm dev:studio

# Build studio
pnpm --filter ./apps/studio build

# Deploy studio to Sanity hosting
pnpm --filter ./apps/studio deploy

# Deploy GraphQL API
pnpm --filter ./apps/studio deploy-graphql
```

### Quality Gates & CI
```bash
# Format all code
pnpm format

# Lint all code
pnpm lint

# Run all tests
pnpm test

# Type checking (if configured)
pnpm typecheck

# Validate Sanity schemas
pnpm --filter ./apps/studio schema:validate
```

## Architecture Overview

### Monorepo Structure
- **pnpm workspaces** with potential for shared packages in `packages/*`
- **Two main apps**: `apps/web` (Next.js frontend) and `apps/studio` (Sanity CMS)
- **Shared configuration** at root level with workspace-specific overrides

### Technology Stack
- **Frontend**: Next.js 15 with App Router, TypeScript strict mode, Turbopack dev server
- **UI**: HeroUI component library + Tailwind CSS v4 with custom tokens
- **CMS**: Sanity v4 with internationalization plugins
- **Testing**: Jest with React Testing Library, jsdom environment
- **Linting**: ESLint v9 with Next.js and Prettier configs
- **Package Management**: pnpm with workspaces

### Data Flow Architecture
1. **Content Creation**: Editors use Sanity Studio (`apps/studio`) to author content
2. **Content Storage**: Sanity Content Lake serves as source of truth via API/GROQ
3. **Content Rendering**: Next.js web app (`apps/web`) fetches content via server components
4. **Static Generation**: Pages use SSG with ISR or full SSR based on requirements
5. **Deployment**: Branch-based deployments (main → production, PRs → preview)

### Key Architectural Patterns
- **Server-first rendering**: Prefer Server Components, use Client Components (`"use client"`) only for interactivity
- **Centralized queries**: GROQ queries in `apps/web/src/lib/sanity/queries.ts`
- **Co-location**: Component, styles, tests, and stories in same folder
- **Path aliases**: Use `@/*` imports configured in tsconfig.json
- **Composition over props**: Prefer slots/asChild patterns for reusable components

### File Organization
```
apps/web/src/
├── app/              # Next.js App Router (pages, layouts, route segments)
├── components/       # Presentational & composed components
│   └── __tests__/   # Component tests alongside code
├── lib/             # Utilities, data-fetching helpers, GROQ wrappers
└── types/           # Shared TypeScript definitions

apps/studio/
├── schemaTypes/     # Sanity schema definitions
│   ├── documents/   # Document types (post, author, category)
│   ├── objects/     # Object types (blockContent, seo, link)
│   └── singletons/  # Singleton types (homepage, settings)
└── sanity.config.ts # Studio configuration
```

## Development Guidelines

### Content Management (Sanity)
- **Schema changes require PR** with migration notes and `schema:validate` CI pass
- **Centralize GROQ queries** in `apps/web/src/lib/sanity/queries.ts`
- **Type safety**: Export TypeScript types for content shapes
- **Preview workflow**: Use Next.js draft mode + Sanity webhooks

### Frontend Development
- **TypeScript strict mode** everywhere with path aliases
- **Server Components by default**, Client Components only when needed
- **Tailwind v4 with tokens**: Avoid hard-coded colors, use CSS variables
- **Testing**: Include unit tests for new components with React Testing Library
- **Image optimization**: Use Next.js `next/image` for all images

### Quality Standards
- **Conventional Commits** for PR titles and commit messages
- **No secrets in repository**: Use hosting provider secret stores
- **Dependency audits** in CI with failure on high severity vulnerabilities
- **Performance budgets**: Target good Core Web Vitals (LCP, CLS, TTFB)
- **Accessibility**: AA baseline with automated and manual testing

## Environment Setup

1. **Prerequisites**: Node.js ≥18.x, pnpm ≥7.x, Git CLI
2. **Environment variables**: Copy `.env.example` to `.env.local` and configure
3. **Development setup**: Run `pnpm install` then `pnpm dev`
4. **First deployment**: Setup Vercel project with environment variables

## Anti-patterns to Avoid
- Fetching Sanity content directly from Client Components
- Large, untyped Client Components containing most application logic
- Scattering fetch logic across pages instead of centralized queries
- Adding heavy third-party libraries without ADR and approval
- Hard-coded styles instead of using design tokens
- Mutating production datasets from local development
