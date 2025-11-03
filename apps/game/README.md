# Data War - Game Application

A mobile-first card game based on the classic "War" card game, themed around billionaires and data privacy for Mozilla's "Open What You Want" campaign.

## Table of Contents

- [Overview](#overview)
- [Game Summary](#game-summary)
- [Documentation](#documentation)
- [Prerequisites](#prerequisites)
- [Development](#development)
- [Build Process](#build-process)
- [Architecture](#architecture)
- [Technologies](#technologies)

## Overview

**Data War** is a standalone React SPA built with Vite and Rolldown. It's designed to be embedded within the Next.js web application at the `/game` route. The game runs independently during development but is automatically built and integrated into the Next.js app during production builds.

## Game Summary

Data War is a variation of the traditional "War" card game where players compete against a CPU opponent to either:

1. **Collect all ~74 cards** (traditional win), or
2. **Collect 3 launch stacks** to send a billionaire to space

### Quick Rules

- Each turn, both player and CPU reveal a card
- Higher card value (1-5) wins both cards
- Special "tracker cards" trigger unique effects:
  - **Play Again**: Draw and play another card immediately
  - **Point Subtraction**: Reduce opponent's turn value by 1
  - **Forced Empathy**: Swap entire decks with opponent
  - **Launch Stack**: Collect 3 to win the game

### Key Features

- Character and background selection
- Quick-start guide and in-game instructions
- Mobile-first design (phone screen on desktop)
- Player vs CPU only (no multiplayer in MVP)
- Victory animations and Firefox CTA

## Documentation

For detailed information about game mechanics, components, and design:

📋 **[README.game.md](../../README.game.md)** - Comprehensive game design document covering:

- Detailed game rules and mechanics
- Card types and special effects
- Win conditions
- Game components breakdown (Board, Cards, Instructions, Game Logic)
- Technical architecture
- Timeline and scope

## Prerequisites

- Node.js >= 18.x
- pnpm >= 7.x

## Development

To run the game in development mode:

```bash
# From monorepo root
pnpm --filter game dev

# Or from this directory
pnpm dev
```

This starts the Vite dev server at `http://localhost:5173` with:

- Hot Module Replacement (HMR)
- React Fast Refresh with React Compiler enabled
- Base path set to `/` for local development

### Developer Tools

#### Debug UI

A built-in debug tool for testing specific card scenarios:

- **Key Sequence**: Press arrow keys in the following order: `Up` `Up` `Down` `Down`
- **Purpose**: Manually compose specific card sequences for player and CPU decks

**Quick Usage:**

1. Press `Up` `Up` `Down` `Down` to open the debug panel
2. Search and select cards for player and/or CPU decks
3. Click "Initialize Game" to restart with your custom deck composition
4. Selected cards appear at the top of each deck in order
5. Remaining slots filled randomly from the card pool

## Build Process

### Automated Build (Recommended)

The game is automatically built when you build the web application:

```bash
# From monorepo root
pnpm build              # Builds all apps, including game
pnpm --filter web build # Builds web app (game builds first via prebuild hook)
```

**What happens during the build:**

1. The web app's `prebuild` script runs first
2. Game is built with `pnpm --filter ./apps/game build`
3. Vite uses base path `/assets/game/` (production only)
4. Build output is generated in `apps/game/dist/`
5. All files from `dist/` are copied to `apps/web/public/assets/game/`
6. Next.js build continues with game assets in place

### Manual Build

You can also build the game manually:

```bash
pnpm --filter game build
# or
pnpm build
```

**Output:** Static files in `apps/game/dist/` with all asset URLs prefixed with `/assets/game/`

### Build Configuration

The Vite config (`vite.config.ts`) uses conditional base paths:

- **Development (`pnpm dev`)**: `base: '/'`
- **Production (`pnpm build`)**: `base: '/assets/game/'`

This ensures assets load correctly when served from the Next.js public directory.

## Architecture

### Integration with Next.js

The game is served as a static SPA from within the Next.js application:

1. **Static Files**: Game build output lives in `apps/web/public/assets/game/`
2. **Routing**: Next.js middleware (in `apps/web/src/middleware.ts`) rewrites `/game` → `/assets/game/index.html`
3. **Assets**: All game assets (images, JS, CSS) are prefixed with `/assets/game/` in production

### File Structure

```
apps/game/
├── dist/              # Build output (gitignored)
├── public/            # Static assets
│   ├── assets/
│   │   └── fonts/     # Symlink to web/public/assets/fonts
│   └── README.md      # Documentation for public assets
├── src/
│   ├── App.tsx        # Main app component
│   └── main.tsx       # Entry point
├── index.html         # HTML template
├── vite.config.ts     # Vite configuration with conditional base paths
├── tsconfig.json      # TypeScript config
└── package.json       # Dependencies and scripts
```

### Font Loading Strategy

The game shares font files with the web app to avoid duplication:

- **Development**: Fonts accessed via symlink at `public/assets/fonts` → `../../web/public/assets/fonts`
- **Production**: Game served from `/assets/game/`, fonts from `/assets/fonts/` (both under web app)
- **CSS**: Font URLs use `/assets/fonts/` (absolute paths work in both environments)

See `public/README.md` for details on recreating the symlink if needed.

### Accessing the Game

**Local Development:**

- Game dev server: `http://localhost:5173`
- Not available in Next.js dev server (run separately)

**Production/Deployed:**

- Accessed via: `https://yourdomain.com/game`
- Served by Next.js as static files
- Complete isolation from Next.js React instance

## Technologies

- **Vite**: Build tool using Rolldown (high-performance Rust-based bundler)
- **React 19**: UI library with React Compiler enabled for optimizations
- **TypeScript**: Type safety
- **Tailwind CSS v4**: Styling via `@tailwindcss/vite` plugin
- **React Compiler**: Automatic optimization via `babel-plugin-react-compiler`

### Key Dependencies

- `vite` (via `rolldown-vite` override in root `package.json`)
- `react` & `react-dom`
- `@vitejs/plugin-react`
- `@tailwindcss/vite`
- `babel-plugin-react-compiler`

## Notes

- The game builds automatically as part of the web build process - no manual intervention needed for deployments
- Asset URLs are automatically handled by Vite's `base` configuration
- The game runs in complete isolation from the Next.js app (separate React instance, no hydration conflicts)
- Changes to the game require rebuilding the web app to see updates in the Next.js context
