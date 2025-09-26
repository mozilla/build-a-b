/**
 * @jest-environment node
 */

import { generateAvatar } from '../generate-avatar';
import { buildImageUrl } from '../../helpers/images';
import { createClient } from '../../supabase/server';
import { cookies } from 'next/headers';
import type { Choice } from '@/types';

// Mock dependencies
jest.mock('../../helpers/images');
jest.mock('../../supabase/server');
jest.mock('next/headers');

const mockBuildImageUrl = buildImageUrl as jest.MockedFunction<typeof buildImageUrl>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('generateAvatar', () => {
  const mockSupabase = {
    rpc: jest.fn(),
    from: jest.fn(),
  };

  const mockCookieStore = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers({ advanceTimers: true });
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockCookies.mockResolvedValue(mockCookieStore);
    mockCookieStore.get.mockReturnValue({ value: 'test-uuid' });
    mockBuildImageUrl.mockReturnValue('https://test.com/image.jpg');
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should generate avatar successfully with valid options', async () => {
    const options: Choice[] = ['mogul', 'fame', 'savior'];
    const mockAvatarData = {
      id: 'avatar-123',
      asset_riding: 'test-asset.png',
      asset_instagram: '',
      character_story: 'Test story',
      first_name: 'John',
      last_name: 'Doe',
    };
    const mockUserData = {
      uuid: 'user-123',
    };

    // Mock RPC call for getting random avatar
    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    // Mock user insertion
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        }),
      }),
    });

    const resultPromise = generateAvatar(options);

    // Fast-forward the 4-second delay
    await jest.advanceTimersByTimeAsync(4000);

    const result = await resultPromise;

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_random_avatar', {
      search_pattern: 'mogul-fame-savior',
    });
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockBuildImageUrl).toHaveBeenCalledWith('test-asset.png');
    expect(result).toEqual({
      originalRidingAsset: 'test-asset.png',
      instragramAsset: '',
      url: 'https://test.com/image.jpg',
      bio: 'Test story',
      name: 'John Doe',
      uuid: 'user-123',
      selfies: [],
    });
  });

  it('should handle avatar RPC error', async () => {
    const options: Choice[] = ['mogul'];

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Avatar not found' },
      }),
    });

    await expect(generateAvatar(options)).rejects.toThrow('Avatar not found');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle user insertion error', async () => {
    const options: Choice[] = ['mogul'];
    const mockAvatarData = {
      id: 'avatar-123',
      asset_riding: 'test-asset.png',
      asset_instagram: '',
      character_story: 'Test story',
      first_name: 'John',
      last_name: 'Doe',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User insertion failed' },
          }),
        }),
      }),
    });

    await expect(generateAvatar(options)).rejects.toEqual({ message: 'User insertion failed' });
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle missing avatar data', async () => {
    const options: Choice[] = ['mogul'];

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    await expect(generateAvatar(options)).rejects.toThrow('Could not retrieve an avatar.');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle empty character story', async () => {
    const options: Choice[] = ['mogul'];
    const mockAvatarData = {
      id: 'avatar-123',
      asset_riding: 'test-asset.png',
      asset_instagram: '',
      character_story: null,
      first_name: 'John',
      last_name: 'Doe',
    };
    const mockUserData = {
      uuid: 'user-123',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null,
          }),
        }),
      }),
    });

    const resultPromise = generateAvatar(options);
    await jest.advanceTimersByTimeAsync(4000);
    const result = await resultPromise;

    expect(result?.bio).toBe('');
    expect(result?.selfies).toEqual([]);
    expect(result?.originalRidingAsset).toBe('test-asset.png');
    expect(result?.instragramAsset).toBe('');
  });
});
