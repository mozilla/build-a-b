# Web Application — Mondolite Boilerplate

The Next.js 15+ TypeScript frontend for the Mondolite monorepo, built with HeroUI, Tailwind CSS, and optimized for performance.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Project Structure](#project-structure)
- [Dependencies Overview](#dependencies-overview)
- [Architecture & Technologies](#architecture--technologies)
- [Styling](#styling)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js >= 18.x
- pnpm >= 7.x
- Git CLI

## Installation

From the monorepo root:

```bash
pnpm install
```

To start the development server:

```bash
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Environment variables are managed in `.env.local` and documented in `.env.example`. Key variables for the web app include:

```env
DEPLOY_BUTTON_VISIBILITY_FLAG=boolean-value
BETA_FEATURE_FLAG=boolean-value
NEXT_PUBLIC_DATAWAR_PDF_URL=https://oqqutatvbdlpumixjiwg.supabase.co/storage/v1/object/public/assets/DataWar_FullGame_Print.pdf
```

To set up your environment variables:

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Update the values in `.env.local` as needed

## Scripts

Available scripts:

```bash
pnpm --filter web dev     # Start development server
pnpm --filter web build   # Build for production
pnpm --filter web start   # Start in production mode
pnpm --filter web lint    # Run ESLint
pnpm --filter web lint:fix# Run ESLint and fix issues
pnpm --filter web format  # Run Prettier
pnpm --filter web test    # Run Jest tests
```

## Project Structure

```
packages/web/
├─ public/          # Static assets (images, icons)
├─ src/
│  ├─ app/          # Next.js App Router files (page.tsx, layout.tsx)
│  │  ├─ api/       # Route handlers (NextAuth, etc.)
│  │  └─ _styles/   # Global CSS (globals.css)
│  ├─ components/   # React components
│  └─ global.d.ts    # Global type declarations
├─ next.config.ts   # Next.js configuration
├─ tsconfig.json    # TypeScript configuration
└─ jest.config.js   # Jest configuration
```

## Dependencies Overview

- `@heroui/react` - HeroUI React components
- `tailwind-plugin` - HeroUI Tailwind plugin
- `next` - Next.js framework (v15.4.5)
- `react` & `react-dom` (v19.1.0)
- `framer-motion` - Animations

## Architecture & Technologies

- App Router (Next.js) with SSR and ISR support
- Turbopack for faster builds and HMR
- Tailwind CSS v4 for utility-first styling
- HeroUI for pre-built UI components
- Vercel Flags SDK for gating

## Styling

- Global styles in [`_styles/globals.css`](packages/web/src/app/_styles/globals.css:1)
- Tailwind CSS configuration in [`postcss.config.mjs`](packages/web/postcss.config.mjs:1)

## Testing

- Jest & React Testing Library
- Tests located alongside components under `__tests__` directories
- To run tests:

```bash
pnpm --filter web test
```

## Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/web-update`
3. Commit changes: `git commit -m "docs(web): update README"`
4. Push and open PR

## License

MIT © Your Company
