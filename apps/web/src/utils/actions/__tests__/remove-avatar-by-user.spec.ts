import { createClient } from '../../supabase/server';
import { removeAvatarByUser } from '../remove-avatar-by-user';

jest.mock('../../supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    rpc: jest.fn().mockReturnValue({
      error: null,
    }),
  }),
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

describe('removeAvatarByUser', () => {
  it('Should call rpc with correct parameters and not throw when successful.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    await removeAvatarByUser('user-123');

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('remove_avatar_by_user', {
      p_uuid: 'user-123',
    });
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('Should log error when rpc returns an error.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      error: { message: 'Database error' },
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    await removeAvatarByUser('user-123');

    expect(rpcMock).toHaveBeenCalledWith('remove_avatar_by_user', {
      p_uuid: 'user-123',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('Should log error in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));

    await removeAvatarByUser('user-123');

    expect(errorSpy).toHaveBeenCalledTimes(1);
  });
});
