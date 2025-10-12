import { createClient } from '../../supabase/server';
import { getCoreDrives } from '../get-core-drives';

jest.mock('../../supabase/server', () => ({
  createClient: jest.fn().mockResolvedValue({
    rpc: jest.fn().mockReturnValue({
      data: null,
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

describe('getCoreDrives', () => {
  it('Should return empty array if data is null.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getCoreDrives('test-origin-story');

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_core_drives', {
      selected_origin_story: 'test-origin-story',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return empty array if error occurs.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getCoreDrives('test-origin-story');

    expect(rpcMock).toHaveBeenCalledWith('get_core_drives', {
      selected_origin_story: 'test-origin-story',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return array of core drives when data is available.', async () => {
    const mockData = [
      { core_drive: 'Power' },
      { core_drive: 'Justice' },
      { core_drive: 'Freedom' },
    ];
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: mockData,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getCoreDrives('hero-origin');

    expect(rpcMock).toHaveBeenCalledWith('get_core_drives', {
      selected_origin_story: 'hero-origin',
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual(['Power', 'Justice', 'Freedom']);
  });

  it('Should return empty array in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));

    const result = await getCoreDrives('test-origin-story');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
