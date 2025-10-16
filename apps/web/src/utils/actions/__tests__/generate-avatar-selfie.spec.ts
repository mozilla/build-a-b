import { COOKIE_NAME } from '../../constants';
import { createClient } from '../../supabase/server';
import { generateAvatarSelfie } from '../generate-avatar-selfie';
import { cookies } from 'next/headers';

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

let errorSpy: jest.SpyInstance;
let logSpy: jest.SpyInstance;

beforeAll(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockClear();
  logSpy.mockClear();
});

afterAll(() => {
  errorSpy.mockRestore();
  logSpy.mockRestore();
});

describe('generateAvatarSelfie', () => {
  it('Should throw error if cookies is not set after initializing supabase.', async () => {
    await expect(generateAvatarSelfie()).rejects.toThrow();

    expect(cookies).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('Should call get_selfie_for_user_avatar function and return null if there are no selfies.', async () => {
    const rpcMock = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValueOnce({
        data: null,
        error: null,
      }),
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: '1234' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await generateAvatarSelfie();

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_selfie_for_user_avatar', { p_uuid: '1234' });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('No more selfies available for this user/avatar.');
    expect(result).toBeNull();
  });

  it('Should call get_selfie_for_user_avatar function and return the data if available.', async () => {
    const mockImageUrl = 'http://localhost:3000/image/path';
    const rpcMock = jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValueOnce({
        data: { asset: mockImageUrl },
        error: null,
      }),
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });
    const getMock = jest.fn(() => ({ value: '1234' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await generateAvatarSelfie();

    expect(rpcMock).toHaveBeenCalledWith('get_selfie_for_user_avatar', { p_uuid: '1234' });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Selfie was successfully generated.', mockImageUrl);
    expect(result).toEqual({ asset: mockImageUrl });
  });

  it('Should call console.error and rethrow in case of unexpected failures.', async () => {
    (cookies as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));
    await expect(generateAvatarSelfie()).rejects.toThrow();

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
