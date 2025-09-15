# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mondo Lite is a Next.js 15+ TypeScript monorepo featuring:
- HeroUI component library for UI components
- Tailwind CSS v4 for styling with custom plugins
- Sanity CMS Studio for content management
- Flags SDK for feature flags
- Performance optimizations (Turbopack, caching, ISR)

## Development Commands

**Root workspace commands:**
```bash
pnpm dev          # Start both web and studio apps in parallel
pnpm build        # Build all packages
pnpm start        # Start web app in production mode
pnpm lint         # Lint all packages
pnpm format       # Format all code with Prettier  
pnpm test         # Run tests (web app only)
```

**Web app specific:**
```bash
pnpm --filter ./apps/web dev      # Start web dev server with Turbopack
pnpm --filter ./apps/web build    # Build web app
pnpm --filter ./apps/web start    # Start web in production
pnpm --filter ./apps/web lint     # Lint web app
pnpm --filter ./apps/web test     # Run Jest tests
pnpm --filter ./apps/web test:watch  # Run tests in watch mode
```

**Studio (Sanity) specific:**
```bash
pnpm --filter ./apps/studio dev        # Start Sanity studio
pnpm --filter ./apps/studio build      # Build studio
pnpm --filter ./apps/studio deploy     # Deploy studio to Sanity
```

## Architecture

**Monorepo Structure:**
- `apps/web/` - Next.js frontend application (App Router)
- `apps/studio/` - Sanity CMS Studio for content management
- `packages/` - Shared packages (future packages for ui, config, utils)

**Frontend Architecture:**
- Next.js 15 with App Router and Server Components
- TypeScript for type safety
- HeroUI as the component library (imported from `@heroui/react`)
- Tailwind CSS v4 for styling with custom CSS variables
- Feature flags implementation using Vercel Flags SDK
- Bento grid layout system with modular components

**Key Technologies:**
- Package manager: pnpm with workspaces
- Build tool: Turbopack for faster development
- CMS: Sanity with GROQ queries and next-sanity integration
- Styling: Tailwind v4 with CSS custom properties for theming
- Testing: Jest with React Testing Library
- Code quality: ESLint, Prettier, Husky with lint-staged

**Component Architecture:**
- Base `Bento` component for consistent card-like layouts
- Specialized bento components (`AvatarBento`, etc.)
- Container component for layout consistency
- Provider pattern for HeroUI theming

**Feature Flags:**
Currently using hardcoded flags in `apps/web/src/app/page.tsx` but set up to integrate with Vercel Flags SDK (`getAllFlags()` is commented out, ready for implementation).

## Quality Gates

Before committing or creating PRs, ensure these pass:
1. `pnpm lint` - ESLint checks
2. `pnpm format` - Prettier formatting  
3. `pnpm test` - Jest test suite
4. `pnpm build` - Successful build of all packages
5. Type checking (built into build process)

## Development Notes

- Use absolute imports with `@/` prefix for the web app
- Follow existing Bento component patterns for new layout components
- HeroUI components should be wrapped in the HeroUIProvider (already configured)
- Tailwind classes use CSS custom properties (e.g., `var(--primary-charcoal)`)
- Feature flags control component rendering - follow existing patterns in `page.tsx`
- Tests are located in `__tests__` directories alongside components