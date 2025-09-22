/**
 * Gets a cookie value by name from document.cookie
 * @param name The name of the cookie to retrieve
 * @returns The cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  /**
   * Normalization for easier parsing - the first cookie isn't prefixed with ';' like all
   * subsequent cookies.
   */
  const value = `; ${document.cookie}`;
  /**
   *  Get the before/after of the cookie for which we're looking
   */
  const parts = value.split(`; ${name}=`);
  /**
   * If there are 2 parts, then our cookie exists
   */
  if (parts.length === 2) {
    /**
     * Take the second of our parts, split on ';' to remove the cookies after
     * our cookie, then return our cookie value.
     */
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }
  return null;
};

export const setCookie = (
  name: string,
  value: string,
  options?: {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  },
): void => {
  if (typeof document === 'undefined') return;

  let cookieString = `${name}=${value}`;

  if (options?.expires) {
    cookieString += `; expires=${options.expires.toUTCString()}`;
  }

  if (options?.path) {
    cookieString += `; path=${options.path}`;
  }

  if (options?.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options?.secure) {
    cookieString += '; secure';
  }

  if (options?.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
};

/**
 * Deletes a cookie by expiration.
 */
export const deleteCookie = (
  name: string,
  options?: {
    path?: string;
    domain?: string;
  },
): void => {
  if (typeof document === 'undefined') return;
  const pastDate = new Date(0);

  setCookie(name, '', {
    expires: pastDate,
    path: options?.path,
    domain: options?.domain,
  });
};

export const parseJsonCookie = <T>(cookieValue: string | null): T | null => {
  if (!cookieValue) return null;

  try {
    return JSON.parse(cookieValue);
  } catch {
    return null;
  }
};

export const cookieExists = (name: string): boolean => {
  return getCookie(name) !== null;
};
