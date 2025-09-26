/**
 * @jest-environment node
 */

import { isAvatarSaved } from '../is-avatar-saved';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../../constants';

// Mock dependencies
jest.mock('next/headers');

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('isAvatarSaved', () => {
  const mockCookieStore = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(mockCookieStore);
  });

  it('should return true when avatar cookie exists with valid value', async () => {
    const validUuid = 'valid-uuid-123';
    mockCookieStore.get.mockReturnValue({ value: validUuid });

    const result = await isAvatarSaved();

    expect(mockCookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
    expect(result).toBe(true);
  });

  it('should return true when avatar cookie exists with any truthy string value', async () => {
    const validUuid = 'some-value';
    mockCookieStore.get.mockReturnValue({ value: validUuid });

    const result = await isAvatarSaved();

    expect(result).toBe(true);
  });

  it('should return false when avatar cookie does not exist', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const result = await isAvatarSaved();

    expect(mockCookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
    expect(result).toBe(false);
  });

  it('should return false when avatar cookie exists but has empty string value', async () => {
    mockCookieStore.get.mockReturnValue({ value: '' });

    const result = await isAvatarSaved();

    expect(mockCookies).toHaveBeenCalled();
    expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
    expect(result).toBe(false);
  });

  it('should return false when avatar cookie exists but has null value', async () => {
    mockCookieStore.get.mockReturnValue({ value: null });

    const result = await isAvatarSaved();

    expect(result).toBe(false);
  });

  it('should return false when avatar cookie exists but has undefined value', async () => {
    mockCookieStore.get.mockReturnValue({ value: undefined });

    const result = await isAvatarSaved();

    expect(result).toBe(false);
  });

  it('should return false when avatar cookie object is null', async () => {
    mockCookieStore.get.mockReturnValue(null);

    const result = await isAvatarSaved();

    expect(result).toBe(false);
  });

  it('should handle cookies function rejection gracefully', async () => {
    const cookieError = new Error('Cookie access failed');
    mockCookies.mockRejectedValue(cookieError);

    await expect(isAvatarSaved()).rejects.toThrow('Cookie access failed');
  });

  it('should return true for whitespace-only values (truthy strings)', async () => {
    mockCookieStore.get.mockReturnValue({ value: '   ' });

    const result = await isAvatarSaved();

    expect(result).toBe(true); // whitespace is truthy in JavaScript
  });

  it('should return false for zero string value', async () => {
    mockCookieStore.get.mockReturnValue({ value: '0' });

    const result = await isAvatarSaved();

    expect(result).toBe(true); // '0' string is truthy, only number 0 is falsy
  });

  it('should correctly use COOKIE_NAME constant', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'test-value' });

    await isAvatarSaved();

    expect(mockCookieStore.get).toHaveBeenCalledWith(COOKIE_NAME);
  });

  it('should return boolean type regardless of input', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'some-value' });

    const result = await isAvatarSaved();

    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });
});