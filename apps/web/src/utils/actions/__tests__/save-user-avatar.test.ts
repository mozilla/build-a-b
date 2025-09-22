/**
 * @jest-environment node
 */

import { saveUserAvatar } from '../save-user-avatar';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME } from '../../constants';

// Mock Next.js functions
jest.mock('next/headers');
jest.mock('next/navigation');

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;
const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;

describe('saveUserAvatar', () => {
  const mockCookieStore = {
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(mockCookieStore);
    // Mock redirect to prevent actual navigation during tests
    mockRedirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT'); // This is how Next.js redirect works in tests
    });
  });

  it('should set cookie and redirect successfully', async () => {
    const uuid = 'user-123';

    await expect(saveUserAvatar(uuid)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockCookies).toHaveBeenCalled();
    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, uuid);
    expect(mockRedirect).toHaveBeenCalledWith(`/a/${uuid}`);
  });

  it('should handle different UUID formats', async () => {
    const uuid = 'test-uuid-with-dashes-123-456';

    await expect(saveUserAvatar(uuid)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, uuid);
    expect(mockRedirect).toHaveBeenCalledWith(`/a/${uuid}`);
  });

  it('should handle empty string UUID', async () => {
    const uuid = '';

    await expect(saveUserAvatar(uuid)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, '');
    expect(mockRedirect).toHaveBeenCalledWith('/a/');
  });

  it('should handle special characters in UUID', async () => {
    const uuid = 'user_123-abc@test';

    await expect(saveUserAvatar(uuid)).rejects.toThrow('NEXT_REDIRECT');

    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, uuid);
    expect(mockRedirect).toHaveBeenCalledWith(`/a/${uuid}`);
  });
});
