/**
 * @jest-environment node
 */

import { getUserAvatar } from '../get-user-avatar';
import { buildImageUrl } from '../../helpers/images';
import { createClient } from '../../supabase/server';

// Mock dependencies
jest.mock('../../helpers/images');
jest.mock('../../supabase/server');

const mockBuildImageUrl = buildImageUrl as jest.MockedFunction<typeof buildImageUrl>;
const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('getUserAvatar', () => {
  const mockSupabase = {
    from: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockBuildImageUrl.mockReturnValue('https://test.com/avatar.jpg');
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should get user avatar successfully', async () => {
    const userUuid = 'user-123';
    const mockUser = {
      avatar_id: 'avatar-456',
    };
    const mockAvatar = {
      id: 'avatar-456',
      combination_key: 'mogul-fame-savior',
      character_story: 'A brave character',
      first_name: 'Jane',
      last_name: 'Smith',
      asset_riding: 'https://original-path.com/avatar.jpg',
    };

    // Mock user query
    const userChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    };

    // Mock avatar query
    const avatarChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockAvatar,
            error: null,
          }),
        }),
      }),
    };

    mockSupabase.from.mockReturnValueOnce(userChain).mockReturnValueOnce(avatarChain);

    const result = await getUserAvatar(userUuid);

    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.from).toHaveBeenCalledWith('avatars');
    expect(mockBuildImageUrl).toHaveBeenCalledWith('https://original-path.com/avatar.jpg');
    expect(result).toEqual({
      url: 'https://test.com/avatar.jpg',
      bio: 'A brave character',
      name: 'Jane Smith',
      uuid: userUuid,
    });
  });

  it('should handle user not found error', async () => {
    const userUuid = 'nonexistent-user';

    const userChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'User not found' },
          }),
        }),
      }),
    };

    mockSupabase.from.mockReturnValue(userChain);

    const result = await getUserAvatar(userUuid);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle missing avatar_id', async () => {
    const userUuid = 'user-123';
    const mockUser = {
      avatar_id: null,
    };

    const userChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    };

    mockSupabase.from.mockReturnValue(userChain);

    const result = await getUserAvatar(userUuid);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle avatar not found error', async () => {
    const userUuid = 'user-123';
    const mockUser = {
      avatar_id: 'avatar-456',
    };

    const userChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    };

    const avatarChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Avatar not found' },
          }),
        }),
      }),
    };

    mockSupabase.from.mockReturnValueOnce(userChain).mockReturnValueOnce(avatarChain);

    const result = await getUserAvatar(userUuid);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle empty character story', async () => {
    const userUuid = 'user-123';
    const mockUser = {
      avatar_id: 'avatar-456',
    };
    const mockAvatar = {
      id: 'avatar-456',
      combination_key: 'mogul-fame-savior',
      character_story: null,
      first_name: 'Jane',
      last_name: 'Smith',
    };

    const userChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    };

    const avatarChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockAvatar,
            error: null,
          }),
        }),
      }),
    };

    mockSupabase.from.mockReturnValueOnce(userChain).mockReturnValueOnce(avatarChain);

    const result = await getUserAvatar(userUuid);

    expect(result?.bio).toBe('');
  });

  it('should handle missing avatar data', async () => {
    const userUuid = 'user-123';
    const mockUser = {
      avatar_id: 'avatar-456',
    };

    const userChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: mockUser,
            error: null,
          }),
        }),
      }),
    };

    const avatarChain = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    };

    mockSupabase.from.mockReturnValueOnce(userChain).mockReturnValueOnce(avatarChain);

    const result = await getUserAvatar(userUuid);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
  });
});
