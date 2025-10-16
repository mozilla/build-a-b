import { COOKIE_NAME } from '../../constants';
import { createClient } from '../../supabase/server';
import { generateAvatar } from '../generate-avatar';
import { cookies } from 'next/headers';
import { buildImageUrl } from '../../helpers/images';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(() => ({})), set: jest.fn() }),
}));

jest.mock('../../supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    rpc: jest.fn().mockReturnValue({
      single: jest.fn(() => ({
        data: null,
        error: null,
      })),
    }),
  }),
}));

jest.mock('../../helpers/images', () => ({
  buildImageUrl: jest.fn((asset) => `https://example.com/${asset}`),
}));

let errorSpy: jest.SpyInstance;
let logSpy: jest.SpyInstance;

beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.useFakeTimers();
});

afterEach(() => {
  errorSpy.mockClear();
  logSpy.mockClear();
});

afterAll(() => {
  errorSpy.mockRestore();
  logSpy.mockRestore();
  jest.useRealTimers();
});

describe('generateAvatar', () => {
  const mockOptions = ['origin', 'drive', 'mask', 'play', 'plan'];

  it('Should throw error if avatar data is null.', async () => {
    const rpcMock = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      }),
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock, set: jest.fn() });

    const promise = generateAvatar(mockOptions);

    await expect(promise).rejects.toThrow();
    expect(cookies).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Starting search with options: ', mockOptions);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('Should throw error if avatar retrieval returns an error.', async () => {
    const rpcMock = jest.fn().mockReturnValue({
      single: jest.fn().mockResolvedValueOnce({
        data: null,
        error: { message: 'Avatar not found' },
      }),
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock, set: jest.fn() });

    const promise = generateAvatar(mockOptions);

    await expect(promise).rejects.toThrow();
    expect(rpcMock).toHaveBeenCalledWith('get_random_avatar_v2', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
      selected_public_mask: 'mask',
      selected_power_play: 'play',
      selected_legacy_plan: 'plan',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('Should throw error if user upsert fails.', async () => {
    const mockAvatar = {
      id: 'avatar-123',
      asset_riding: 'riding.png',
      asset_instagram: 'instagram.png',
      character_story: 'A great story',
      first_name: 'John',
      last_name: 'Doe',
    };
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockAvatar,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: null,
          error: { message: 'Upsert failed' },
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock, set: jest.fn() });

    const promise = generateAvatar(mockOptions);

    await expect(promise).rejects.toThrow();
    expect(rpcMock).toHaveBeenCalledTimes(2);
    expect(rpcMock).toHaveBeenNthCalledWith(2, 'upsert_user_with_avatar', {
      p_uuid: 'user-123',
      p_avatar_id: 'avatar-123',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('Should successfully generate avatar and return avatar data.', async () => {
    const mockAvatar = {
      id: 'avatar-123',
      asset_riding: 'riding.png',
      asset_instagram: 'instagram.png',
      character_story: 'A great story',
      first_name: 'John',
      last_name: 'Doe',
    };
    const mockUser = {
      uuid: 'user-123',
    };
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockAvatar,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockUser,
          error: null,
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'user-123' }));
    const setMock = jest.fn();
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock, set: setMock });

    const promise = generateAvatar(mockOptions);
    await jest.advanceTimersByTimeAsync(4000);
    const result = await promise;

    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(rpcMock).toHaveBeenCalledWith('get_random_avatar_v2', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
      selected_public_mask: 'mask',
      selected_power_play: 'play',
      selected_legacy_plan: 'plan',
    });
    expect(rpcMock).toHaveBeenCalledWith('upsert_user_with_avatar', {
      p_uuid: 'user-123',
      p_avatar_id: 'avatar-123',
    });
    expect(setMock).not.toHaveBeenCalled();
    expect(buildImageUrl).toHaveBeenCalledWith('riding.png');
    expect(logSpy).toHaveBeenCalledWith('Starting search with options: ', mockOptions);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual({
      originalRidingAsset: 'riding.png',
      instragramAsset: 'instagram.png',
      url: 'https://example.com/riding.png',
      bio: 'A great story',
      name: 'John Doe',
      uuid: 'user-123',
      selfies: [],
      selfieAvailability: {
        selfies_available: 0,
        next_at: null,
      },
    });
  });

  it('Should set new cookie if uuid changes.', async () => {
    const mockAvatar = {
      id: 'avatar-123',
      asset_riding: 'riding.png',
      asset_instagram: 'instagram.png',
      character_story: 'A great story',
      first_name: 'John',
      last_name: 'Doe',
    };
    const mockUser = {
      uuid: 'new-user-456',
    };
    const rpcMock = jest
      .fn()
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockAvatar,
          error: null,
        }),
      })
      .mockReturnValueOnce({
        single: jest.fn().mockResolvedValueOnce({
          data: mockUser,
          error: null,
        }),
      });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: 'old-user-123' }));
    const setMock = jest.fn();
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock, set: setMock });

    const promise = generateAvatar(mockOptions);
    await jest.advanceTimersByTimeAsync(4000);
    const result = await promise;

    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith(COOKIE_NAME, 'new-user-456');
    expect(result?.uuid).toBe('new-user-456');
  });

  it('Should throw error in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: jest.fn(), set: jest.fn() });

    await expect(generateAvatar(mockOptions)).rejects.toThrow();

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
