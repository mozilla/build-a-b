/**
 * @jest-environment node
 */

import { getUserAvatar } from '../get-user-avatar';
import { buildImageUrl } from '../../helpers/images';
import { createClient } from '../../supabase/server';
import { cookies } from 'next/headers';

// Mock dependencies
jest.mock('../../helpers/images');
jest.mock('../../supabase/server');
jest.mock('next/headers');

const mockBuildImageUrl = buildImageUrl as jest.MockedFunction<typeof buildImageUrl>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('getUserAvatar', () => {
  const mockSupabase = {
    rpc: jest.fn(),
  };

  const mockCookieStore = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockCookies.mockResolvedValue(mockCookieStore);
    mockCookieStore.get.mockReturnValue({ value: 'default-uuid' });
    mockBuildImageUrl.mockReturnValue('https://test.com/avatar.jpg');
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should get user avatar successfully with provided UUID', async () => {
    const userUuid = 'user-123';
    const mockAvatarData = {
      avatar_id: 'avatar-456',
      asset_riding: 'https://original-path.com/avatar.jpg',
      asset_instagram: 'https://instagram-path.com/avatar.jpg',
      character_story: 'A brave character',
      first_name: 'Jane',
      last_name: 'Smith',
      selfies: [
        { id: 1, asset: 'selfie1.jpg', created_at: '2023-01-01' },
        { id: 2, asset: 'selfie2.jpg', created_at: '2023-01-02' },
      ],
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    const result = await getUserAvatar(userUuid);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_avatar_by_uuid', {
      user_uuid: userUuid,
    });
    expect(mockBuildImageUrl).toHaveBeenCalledWith('https://original-path.com/avatar.jpg');
    expect(result).toEqual({
      originalRidingAsset: 'https://original-path.com/avatar.jpg',
      instragramAsset: 'https://instagram-path.com/avatar.jpg',
      url: 'https://test.com/avatar.jpg',
      bio: 'A brave character',
      name: 'Jane Smith',
      uuid: userUuid,
      selfies: [
        { id: 1, asset: 'selfie1.jpg', created_at: '2023-01-01' },
        { id: 2, asset: 'selfie2.jpg', created_at: '2023-01-02' },
      ],
    });
  });

  it('should get user avatar successfully using cookie UUID when no UUID provided', async () => {
    const cookieUuid = 'cookie-uuid-123';
    mockCookieStore.get.mockReturnValue({ value: cookieUuid });

    const mockAvatarData = {
      avatar_id: 'avatar-456',
      asset_riding: 'https://original-path.com/avatar.jpg',
      asset_instagram: 'https://instagram-path.com/avatar.jpg',
      character_story: 'Cookie user story',
      first_name: 'Cookie',
      last_name: 'User',
      selfies: [],
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    const result = await getUserAvatar();

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_avatar_by_uuid', {
      user_uuid: cookieUuid,
    });
    expect(result?.uuid).toBe(cookieUuid);
    expect(result?.selfies).toEqual([]);
  });

  it('should handle RPC error', async () => {
    const userUuid = 'nonexistent-user';

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'User not found' },
      }),
    });

    const result = await getUserAvatar(userUuid);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_avatar_by_uuid', {
      user_uuid: userUuid,
    });
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle missing avatar data', async () => {
    const userUuid = 'user-123';

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    const result = await getUserAvatar(userUuid);

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_avatar_by_uuid', {
      user_uuid: userUuid,
    });
    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle empty character story', async () => {
    const userUuid = 'user-123';
    const mockAvatarData = {
      avatar_id: 'avatar-456',
      asset_riding: 'https://original-path.com/avatar.jpg',
      asset_instagram: 'https://instagram-path.com/avatar.jpg',
      character_story: null,
      first_name: 'Jane',
      last_name: 'Smith',
      selfies: [],
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    const result = await getUserAvatar(userUuid);

    expect(result?.bio).toBe('');
    expect(result?.selfies).toEqual([]);
  });

  it('should handle empty selfies array', async () => {
    const userUuid = 'user-123';
    const mockAvatarData = {
      avatar_id: 'avatar-456',
      asset_riding: 'https://original-path.com/avatar.jpg',
      asset_instagram: 'https://instagram-path.com/avatar.jpg',
      character_story: 'Test story',
      first_name: 'Jane',
      last_name: 'Smith',
      selfies: [],
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    const result = await getUserAvatar(userUuid);

    expect(result?.selfies).toEqual([]);
  });

  it('should handle missing UUID in cookies and parameter', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const result = await getUserAvatar();

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle missing asset fields gracefully', async () => {
    const userUuid = 'user-123';
    const mockAvatarData = {
      avatar_id: 'avatar-456',
      asset_riding: null,
      asset_instagram: null,
      character_story: 'Test story',
      first_name: 'Jane',
      last_name: 'Smith',
      selfies: [],
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    const result = await getUserAvatar(userUuid);

    expect(result?.originalRidingAsset).toBe('');
    expect(result?.instragramAsset).toBe('');
    expect(mockBuildImageUrl).toHaveBeenCalledWith(null);
  });
});
