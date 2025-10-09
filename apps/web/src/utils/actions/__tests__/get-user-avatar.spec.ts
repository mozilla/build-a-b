import { COOKIE_NAME } from '../../constants';
import { createClient } from '../../supabase/server';
import { getUserAvatar } from '../get-user-avatar';
import { cookies } from 'next/headers';
import { buildImageUrl } from '../../helpers/images';
import { sortSelfies } from '../../helpers/order-by-date';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(() => ({})) }),
}));

jest.mock('../../supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    rpc: jest.fn().mockReturnValue({
      maybeSingle: jest.fn(() => ({
        data: null,
        error: null,
      })),
    }),
  }),
}));

jest.mock('../../helpers/images', () => ({
  buildImageUrl: jest.fn((asset) => `https://example.com/${asset}`),
}));

jest.mock('../../helpers/order-by-date', () => ({
  sortSelfies: jest.fn(() => (a: any, b: any) => 0),
}));

let errorSpy: jest.SpyInstance;

beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockClear();
});

afterAll(() => {
  errorSpy.mockRestore();
});

describe('getUserAvatar', () => {
  it('Should return null if no user uuid is provided and no cookie exists.', async () => {
    const getMock = jest.fn(() => undefined);
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });
    (createClient as jest.Mock).mockResolvedValueOnce({
      rpc: jest.fn().mockReturnValue({
        maybeSingle: jest.fn(),
      }),
    });

    const result = await getUserAvatar();

    expect(cookies).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('Should return null if avatar error occurs.', async () => {
    const rpcMock = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Avatar not found' },
      }),
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await getUserAvatar();

    expect(rpcMock).toHaveBeenCalledWith('get_user_avatar_by_uuid', { user_uuid: 'user-123' });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('Should return null if selfie availability error occurs.', async () => {
    const mockAvatar = {
      id: 'avatar-123',
      asset_riding: 'riding.png',
      asset_instagram: 'instagram.png',
      character_story: 'A great story',
      first_name: 'John',
      last_name: 'Doe',
      selfies: [],
    };
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: mockAvatar,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Selfie availability error' },
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await getUserAvatar();

    expect(rpcMock).toHaveBeenCalledWith('get_user_avatar_by_uuid', { user_uuid: 'user-123' });
    expect(rpcMock).toHaveBeenCalledWith('get_available_selfies', { p_uuid: 'user-123' });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });

  it('Should return null if avatar data is null (no avatar found).', async () => {
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: null,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: { selfies_available: 0, next_at: null },
          error: null,
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await getUserAvatar();

    expect(rpcMock).toHaveBeenCalledWith('get_user_avatar_by_uuid', { user_uuid: 'user-123' });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('Should return avatar data when everything succeeds using cookie.', async () => {
    const mockAvatar = {
      id: 'avatar-123',
      asset_riding: 'riding.png',
      asset_instagram: 'instagram.png',
      character_story: 'A great story',
      first_name: 'John',
      last_name: 'Doe',
      selfies: [{ id: 1 }, { id: 2 }],
    };
    const mockSelfieAvailability = {
      selfies_available: 3,
      next_at: '2025-01-15T00:00:00Z',
    };
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: mockAvatar,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: mockSelfieAvailability,
          error: null,
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await getUserAvatar();

    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(rpcMock).toHaveBeenCalledWith('get_user_avatar_by_uuid', { user_uuid: 'user-123' });
    expect(rpcMock).toHaveBeenCalledWith('get_available_selfies', { p_uuid: 'user-123' });
    expect(buildImageUrl).toHaveBeenCalledWith('riding.png');
    expect(sortSelfies).toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      originalRidingAsset: 'riding.png',
      instragramAsset: 'instagram.png',
      url: 'https://example.com/riding.png',
      bio: 'A great story',
      name: 'John Doe',
      uuid: 'user-123',
      selfies: [{ id: 1 }, { id: 2 }],
      selfieAvailability: {
        selfies_available: 3,
        next_at: new Date('2025-01-15T00:00:00Z'),
      },
    });
  });

  it('Should return avatar data when user uuid is provided directly.', async () => {
    const mockAvatar = {
      id: 'avatar-456',
      asset_riding: 'riding2.png',
      asset_instagram: 'instagram2.png',
      character_story: 'Another story',
      first_name: 'Jane',
      last_name: 'Smith',
      selfies: [],
    };
    const mockSelfieAvailability = {
      selfies_available: 0,
      next_at: null,
    };
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: mockAvatar,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        maybeSingle: jest.fn().mockResolvedValueOnce({
          data: mockSelfieAvailability,
          error: null,
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    (cookies as jest.Mock).mockResolvedValueOnce({ get: jest.fn() });

    const result = await getUserAvatar('user-456');

    expect(rpcMock).toHaveBeenCalledWith('get_user_avatar_by_uuid', { user_uuid: 'user-456' });
    expect(rpcMock).toHaveBeenCalledWith('get_available_selfies', { p_uuid: 'user-456' });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result?.uuid).toBe('user-456');
    expect(result?.name).toBe('Jane Smith');
  });

  it('Should return null in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: jest.fn(() => ({ value: 'user-123' })) });

    const result = await getUserAvatar();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toBeNull();
  });
});
