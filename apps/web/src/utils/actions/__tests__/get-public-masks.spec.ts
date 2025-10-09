import { createClient } from '../../supabase/server';
import { getPublicMasks } from '../get-public-masks';

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

describe('getPublicMasks', () => {
  it('Should return empty array if data is null.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getPublicMasks('origin', 'drive');

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_public_masks', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
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

    const result = await getPublicMasks('origin', 'drive');

    expect(rpcMock).toHaveBeenCalledWith('get_public_masks', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return array of public masks when data is available.', async () => {
    const mockData = [
      { public_mask: 'The Defender' },
      { public_mask: 'The Protector' },
      { public_mask: 'The Guardian' },
    ];
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: mockData,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getPublicMasks('hero-origin', 'justice');

    expect(rpcMock).toHaveBeenCalledWith('get_public_masks', {
      selected_origin_story: 'hero-origin',
      selected_core_drive: 'justice',
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual(['The Defender', 'The Protector', 'The Guardian']);
  });

  it('Should return empty array in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));

    const result = await getPublicMasks('origin', 'drive');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
