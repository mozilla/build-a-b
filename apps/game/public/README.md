# Game Public Assets

This directory contains static assets served during game development.

## Font Symlink

The `assets/fonts` symlink points to `../../web/public/assets/fonts` to share font files between the web and game apps without duplication.

### Why This Works

**In Development** (`pnpm dev:game`):
- Vite serves files from `public/` at the root path `/`
- Font URLs like `/assets/fonts/Sharp Sans.woff` resolve to `public/assets/fonts/Sharp Sans.woff`
- The symlink redirects to the actual fonts in the web app

**In Production** (`/datawar/game`):
- Game is built and copied to `web/public/assets/game/`
- Font URLs like `/assets/fonts/Sharp Sans.woff` resolve to `web/public/assets/fonts/Sharp Sans.woff`
- Both game and web app share the same font files from the web app's public directory

### Recreating the Symlink

If the symlink is lost, recreate it from the repository root:

```bash
mkdir -p apps/game/public/assets
cd apps/game/public/assets
ln -s ../../../web/public/assets/fonts fonts
```

Or on Windows (requires admin):
```cmd
mklink /D apps\game\public\assets\fonts ..\..\..\web\public\assets\fonts
```

### Benefits

✅ No font duplication  
✅ Single source of truth for font files  
✅ Works in both development and production  
✅ No build-time copying needed  
✅ Fonts are cached efficiently by the browser
