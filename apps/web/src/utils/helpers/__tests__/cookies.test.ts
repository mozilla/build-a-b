/**
 * @jest-environment jsdom
 */

import { deleteCookie, getCookie, parseJsonCookie, setCookie } from '../cookies';

let cookieStore = '';

// Mocks document.cookie to accurately reflect the in-browser setter behavior
Object.defineProperty(document, 'cookie', {
  get: () => cookieStore,
  set: (value: string) => {
    const [cookiePart] = value.split(';');
    const [name, val] = cookiePart.split('=');
    /**
     * Overwriting a same-name cookie is handled via filtering
     */
    const existingCookies = cookieStore ? cookieStore.split('; ') : [];
    const filteredCookies = existingCookies.filter((cookie) => {
      const [cookieName] = cookie.split('=');
      return cookieName !== name;
    });

    filteredCookies.push(`${name}=${val}`);
    cookieStore = filteredCookies.join('; ');
  },
  configurable: true,
});

describe('Cookie utilities', () => {
  beforeEach(() => {
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
    it('should delete a cookie', () => {
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
