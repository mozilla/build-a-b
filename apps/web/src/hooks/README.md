# Custom Hooks

This directory contains custom React hooks for handling related functionality across the application.

## Available Hooks

### `useNavigatorShareDetection`

Detects native navigator share capability without handling the actual sharing.

```tsx
import { useNavigatorShareDetection } from '@/hooks';

const { isNavigatorShareAvailable } = useNavigatorShareDetection();
```

**Returns:**

- `isNavigatorShareAvailable: boolean` - Whether native sharing is supported

### `useNavigatorShareAction`

Handles native navigator share functionality with avatar images (no feature detection).

```tsx
import { useNavigatorShareAction } from '@/hooks';

const { handleNavigatorShare } = useNavigatorShareAction({ avatar });
```

**Returns:**

- `handleNavigatorShare: () => Promise<void>` - Function to trigger native share

### `useAvatarDownload`

Prepares avatar images for download by creating blob URLs.

```tsx
import { useAvatarDownload } from '@/hooks';

const { downloadFile, isDownloadReady } = useAvatarDownload({ avatar });
```

**Returns:**

- `downloadFile: { href: string; fileName: string }` - Download URL and filename
- `isDownloadReady: boolean` - Whether the download is ready

### `useShareUrls`

Generates social media share URLs and handles current page URL.

```tsx
import { useShareUrls } from '@/hooks';

const { currentHref, threadsShareUrl, safeHref } = useShareUrls();
```

**Returns:**

- `currentHref: string` - Current page URL
- `threadsShareUrl: string` - Threads share URL with hashtags
- `safeHref: (url: string) => string` - Utility to make URLs safe for navigation by returning a hash (`"#"`) when the `window.location.href` has yet to be stored in state.

### `useSafeClick`

Handles safe click behavior with conditional prevention when the provided test fails.

```tsx
import { useSafeClick } from '@/hooks';

const { preventInvalidClick } = useSafeClick();

// Usage in JSX
<a href={someUrl} onClick={(e) => preventInvalidClick(e, isUrlReady)}>
  Download
</a>;
```

**Returns:**

- `preventInvalidClick: (e: MouseEvent, test: boolean, cb?: () => void) => void`

### `useAvatarActions` (Comprehensive Hook)

Combines all avatar-related functionality into a single hook for convenience.

```tsx
import { useAvatarActions } from '@/hooks';

const avatarActions = useAvatarActions({ avatar });

// Access all functionality
const {
  // Navigator share
  isNavigatorShareAvailable,
  handleNavigatorShare,

  // Download
  downloadFile,
  isDownloadReady,

  // Share URLs
  currentHref,
  threadsShareUrl,
  safeHref,

  // Safe click handling
  preventInvalidClick,
} = avatarActions;
```
