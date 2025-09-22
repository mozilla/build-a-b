/**
 * @jest-environment jsdom
 */

import { deleteCookie, getCookie, parseJsonCookie, setCookie } from '../cookies';

let cookieStore = '';

// Mocks document.cookie in a way that accurately reflects the in-browser setter
Object.defineProperty(document, 'cookie', {
  get: () => cookieStore,
  set: (value: string) => {
    // Parse the new cookie being set
    const [cookiePart] = value.split(';');
    const [name, val] = cookiePart.split('=');

    // Check if this is a deletion (expired date or max-age=0)
    const isDeleting = value.includes('expires=Thu, 01 Jan 1970') || value.includes('max-age=0');

    if (isDeleting) {
      // Remove the cookie from the store
      const cookies = cookieStore.split('; ').filter((cookie) => {
        const [cookieName] = cookie.split('=');
        return cookieName !== name;
      });
      cookieStore = cookies.join('; ');
    } else {
      // Remove existing cookie with same name if it exists
      const existingCookies = cookieStore ? cookieStore.split('; ') : [];
      const filteredCookies = existingCookies.filter((cookie) => {
        const [cookieName] = cookie.split('=');
        return cookieName !== name;
      });

      // Add the new cookie
      filteredCookies.push(`${name}=${val}`);
      cookieStore = filteredCookies.join('; ');
    }
  },
  configurable: true,
});

describe('Cookie utilities', () => {
  beforeEach(() => {
    // Clear cookies before each test
    cookieStore = '';
  });

  describe('setCookie and getCookie', () => {
    it('should set and get a simple cookie', () => {
      setCookie('test', 'value');
      expect(getCookie('test')).toBe('value');
    });

    it('should return null for non-existent cookie', () => {
      expect(getCookie('nonexistent')).toBeNull();
    });

    it('should handle multiple cookies', () => {
      setCookie('cookie1', 'value1');
      setCookie('cookie2', 'value2');

      expect(getCookie('cookie1')).toBe('value1');
      expect(getCookie('cookie2')).toBe('value2');
    });
  });

  describe('deleteCookie', () => {
    it('should delete an existing cookie', () => {
      setCookie('test', 'value');
      expect(getCookie('test')).toBe('value');

      deleteCookie('test');
      expect(getCookie('test')).toBeNull();
    });
  });

  describe('parseJsonCookie', () => {
    it('should parse valid JSON', () => {
      const data = ['item1', 'item2'];
      const result = parseJsonCookie<string[]>(JSON.stringify(data));
      expect(result).toEqual(data);
    });

    it('should return null for invalid JSON', () => {
      const result = parseJsonCookie('invalid json');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = parseJsonCookie(null);
      expect(result).toBeNull();
    });
  });
});
