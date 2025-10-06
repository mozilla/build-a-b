# DataWar Feature Flag

The DataWar pages are now protected behind a feature flag called `showDataWar`.

## How it works

- **Flag name**: `showDataWar`
- **Environment variable**: `FLAG_SHOW_DATA_WAR`
- **Default value**: `false` (disabled)

## Protected pages

The following pages are now protected by this feature flag:
- `/datawar` - Main DataWar page
- `/datawar/instructions` - DataWar instructions page

## Navigation

The "Data War" link in the main navigation (header and footer) will only appear when the feature flag is enabled.

## How to enable

To enable the DataWar feature, set the environment variable:

```bash
FLAG_SHOW_DATA_WAR=true
```

## How to disable

To disable the DataWar feature, either:
1. Set the environment variable to `false`:
   ```bash
   FLAG_SHOW_DATA_WAR=false
   ```
2. Or remove the environment variable entirely (defaults to `false`)

## Behavior when disabled

When the feature flag is disabled:
- The `/datawar` and `/datawar/instructions` pages will return a 404 error
- The "Data War" navigation link will not appear in the header or footer
- Users cannot access any DataWar-related functionality

## Implementation details

The feature flag is implemented using the existing flags system in `apps/web/src/app/flags.ts` and follows the same pattern as other feature flags in the application.
