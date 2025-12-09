# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

**Mondo Lite** is a Next.js 15+ TypeScript monorepo starter kit featuring HeroUI components and Tailwind CSS v4. This is a white-label boilerplate designed for rapid client site deployment with consistent quality gates and architectural patterns.

## Common Development Commands

### Core Workflow
```bash
# Install dependencies
pnpm install

# Start all services (web + game)
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

### Game App Development (`apps/game`)
```bash
# Start game locally
pnpm --filter ./apps/game dev
# or: pnpm dev:game

# Build game
pnpm --filter ./apps/game build

# Run game tests
pnpm --filter ./apps/game test
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
```

## Architecture Overview

### Monorepo Structure
- **pnpm workspaces** with potential for shared packages in `packages/*`
- **Two main apps**: `apps/web` (Next.js frontend) and `apps/game` (Vite/React game)
- **Shared configuration** at root level with workspace-specific overrides

### Technology Stack
- **Frontend**: Next.js 15 with App Router, TypeScript strict mode, Turbopack dev server
- **UI**: HeroUI component library + Tailwind CSS v4 with custom tokens
- **Testing**: Jest with React Testing Library, jsdom environment
- **Linting**: ESLint v9 with Next.js and Prettier configs
- **Package Management**: pnpm with workspaces

### Data Flow Architecture
1. **Content Rendering**: Next.js web app (`apps/web`) serves pages with SSG/ISR
2. **Static Generation**: Pages use SSG with ISR or full SSR based on requirements
3. **Deployment**: Branch-based deployments (main → production, PRs → preview)

### Key Architectural Patterns
- **Server-first rendering**: Prefer Server Components, use Client Components (`"use client"`) only for interactivity
- **Co-location**: Component, styles, tests, and stories in same folder
- **Path aliases**: Use `@/*` imports configured in tsconfig.json
- **Composition over props**: Prefer slots/asChild patterns for reusable components

### File Organization
```
apps/web/src/
├── app/              # Next.js App Router (pages, layouts, route segments)
├── components/       # Presentational & composed components
│   └── __tests__/   # Component tests alongside code
├── lib/             # Utilities, data-fetching helpers
└── types/           # Shared TypeScript definitions

apps/game/
├── src/             # Game source code
├── public/          # Static assets
└── vite.config.ts   # Vite configuration
```

## Development Guidelines

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
4. **First deployment**: Setup Netlify project with environment variables

## Anti-patterns to Avoid
- Large, untyped Client Components containing most application logic
- Scattering fetch logic across pages instead of centralized modules
- Adding heavy third-party libraries without ADR and approval
- Hard-coded styles instead of using design tokens
