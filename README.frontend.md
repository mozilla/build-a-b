# Frontend — BBO Microsite

This document describes frontend conventions, patterns and commands for the BBO Microsite starter (Next.js + TypeScript + Tailwind + HeroUI).

## Language & conventions

- TypeScript strict mode everywhere. Use path aliases in `tsconfig.json` for shared packages.
- React: prefer Server Components where possible; opt into Client Components (`"use client"`) only for interactive code.
- Co-locate component, styles, tests and stories in the same folder.
- Keep components small and framework-friendly; prefer composition (slots, asChild) over large prop APIs.

## Styling & UI

- Tailwind CSS v4 (utility-first, token-driven). Keep tokens (colors, spacing, radii) in `packages/ui`.
- HeroUI is the UI kit; wrap or extend reusable patterns in `packages/ui/components`.
- Avoid hard-coded colors; consume CSS variables / tokens.

## Responsive Typography: Linear Scaling

This project utilizes a linear scaling approach for typography and spacing to create a fluidly responsive design that works across all viewport sizes without breakpoints.

**How it Works:**
The root `font-size` on the `<html>` element is set using viewport width (`vw`) units, as seen in `apps/web/src/styles/typography.css`. This means that the base font size scales proportionally with the width of the browser window.

**Usage Requirements:**
For this scaling to work correctly, all length units in the application **must be in `rem`s**. This includes `font-size`, `margin`, `padding`, `width`, `height`, etc. Using `rem`s ties the size of an element to the root font size, allowing the entire layout to scale up or down while maintaining its aspect ratio perfectly.

- **DO:** `mt-4`, `p-[1.25rem]`
- **DO NOT:** `mt-[16px]`, `p-[20px]`

**Challenges & Watchouts:**
- **Extreme Viewport Sizes:** Without constraints, text can become unreadably small on very narrow screens. We will use CSS functions like `max()` to set minimum size caps.
- **Accessibility:** Browser "zoom" does not work as expected with relative sizing. To achieve this we would need a custom "zoomed" template to change sizes.
- **Third-Party Components:** Components from external libraries may use fixed `px` values. This can cause them to appear misaligned or out of proportion with the rest of the UI. These components may require style overrides to conform to the `rem`-based system.

## Next.js specifics (apps/web)

- Routing: App Router under [`apps/web/app`](apps/web/app:1) (segment layouts + server components).
- Data fetching: prefer server fetches in server components. Use ISR via `export const revalidate = <seconds>` or tag revalidation for dynamic content.
- Image & font optimization: use Next built-in image and font handling (`next/image`, `next/font`).
- Hosting is managed by Netlify.

## File layout (recommended)

- `apps/web/src/components/*` — presentational & small composed components
- `apps/web/src/app/*` — route segments, layouts, pages
- `apps/web/src/lib/*` — utilities, data-fetching helpers, GROQ query wrappers
- `packages/ui/*` — design tokens, presets, shared components

## Testing & stories

- Unit / component tests: Jest / React Testing Library or Vitest depending on workspace config. Place tests alongside code with `__tests__` or `.test.tsx`.
- Storybook (if enabled): include a story for new components.

## Commands (root / workspace)

- Install: `pnpm install`
- Dev (web): `pnpm --filter ./apps/web dev` (or `pnpm dev` from root if root orchestrates)
- Build (web): `pnpm --filter ./apps/web build`
- Start (web prod): `pnpm --filter ./apps/web start`
- Lint: `pnpm --filter ./apps/web lint` or `pnpm lint` from root
- Typecheck: `pnpm --filter ./apps/web typecheck` or `pnpm typecheck` from root
- Test: `pnpm --filter ./apps/web test` or `pnpm test` from root

## Default AI/integrator instructions (frontend)

- Produce minimal diffs. Respect lint/format/type rules.
- Do not add new UI libs or big dependencies without an ADR.
- New components must include: a small unit test, a usage example (story or example page), and a short a11y note.

## Quick links

- Web app: [`apps/web`](apps/web:1)
- Shared UI: [`packages/ui`](packages/ui:1) (if present)