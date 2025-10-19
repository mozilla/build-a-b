# Mondo Lite — Sanity CMS Studio

The Sanity Studio for content editing and management powering the Mondo Lite blog.  
Built with Sanity v4 and configured for internationalization, custom schemas, and developer-friendly tooling.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Schema Definitions](#schema-definitions)
- [Plugins & Internationalization](#plugins--internationalization)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites
- Node.js >= 18.x  
- pnpm >= 7.x  
- Git CLI

## Getting Started
From the monorepo root, install all dependencies once:
```bash
pnpm install
```
Start the Sanity Studio:
```bash
pnpm --filter studio dev
```
Open http://localhost:3333 in your browser to access the Studio.

## Configuration
The project configuration lives in [`sanity.config.ts`](packages/studio/sanity.config.ts:1), including:
- **projectId** (`<your-project-id>`)  
- **dataset** (`production`)  
- Studio **title** and **name**  
- Enabled **plugins**

To customize, edit these values or replace with environment variables as needed:
```bash
cp .env.example .env.local
# Update .env.local if overriding projectId or dataset
```

## Project Structure
```
packages/studio/
├─ schemaTypes/         # Content schema definitions (post, author, category, etc.)
├─ static/              # Static assets (e.g., images)
├─ sanity.config.ts     # Studio configuration and plugin setup
├─ sanity.cli.ts        # CLI configuration for custom commands
├─ package.json         # Studio package metadata and scripts
└─ tsconfig.json        # TypeScript configuration for the studio
```

## Available Scripts
From monorepo root or within `packages/studio`:

```bash
pnpm --filter studio dev              # Run Studio in development (http://localhost:3333)
pnpm --filter studio build            # Build production-ready Studio assets
pnpm --filter studio start            # Preview built Studio locally
pnpm --filter studio deploy           # Deploy Studio to Sanity hosting
pnpm --filter studio deploy-graphql   # Deploy GraphQL API to Sanity
```

## Schema Definitions
Schema types are defined under [`schemaTypes/`](packages/studio/schemaTypes:1), including:
- `author.ts`  
- `category.ts`  
- `post.ts`  
- `blockContent.ts`  
- `index.ts` (exports all types)

Customize or extend schemas by adding new files or fields in this directory.

## Plugins & Internationalization
Configured plugins in [`sanity.config.ts`](packages/studio/sanity.config.ts:1):
- `structureTool()` — Custom Studio desk structure  
- `visionTool()` — Real-time GROQ query playground  
- `documentInternationalization()` — i18n support for document-level translation  
- `internationalizedArray()` — Multi-language arrays for strings and text  

Supported languages:
- English (`en`)

## Contributing
1. Fork the repository  
2. Create a branch:  
   ```bash
   git checkout -b feature/awesome-studio-change
   ```  
3. Make your changes and commit:  
   ```bash
   git commit -m "feat(studio): add new schema field"
   ```  
4. Push and open a PR.

## License
MIT © Your Company
