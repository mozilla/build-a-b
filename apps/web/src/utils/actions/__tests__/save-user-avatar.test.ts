/**
 * @jest-environment node
 */

import { saveUserAvatar } from '../save-user-avatar';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '../../constants';

// Mock Next.js functions
jest.mock('next/headers');
jest.mock('next/navigation');

const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

describe('saveUserAvatar', () => {
  const mockCookieStore = {
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCookies.mockResolvedValue(mockCookieStore);
  });

  it('should set cookie and redirect successfully', async () => {
    const uuid = 'user-123';

    await saveUserAvatar(uuid);
    expect(mockCookies).toHaveBeenCalled();
    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, uuid);
  });

  it('should handle different UUID formats', async () => {
    const uuid = 'test-uuid-with-dashes-123-456';

    await saveUserAvatar(uuid);

    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, uuid);
  });

  it('should handle empty string UUID', async () => {
    const uuid = '';

    await saveUserAvatar(uuid);

    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, '');
  });

  it('should handle special characters in UUID', async () => {
    const uuid = 'user_123-abc@test';

    await saveUserAvatar(uuid);

    expect(mockCookieStore.set).toHaveBeenCalledWith(COOKIE_NAME, uuid);
  });
});
