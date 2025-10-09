import { createClient } from '../../supabase/server';
import { getPowerPlays } from '../get-power-plays';

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

describe('getPowerPlays', () => {
  it('Should return empty array if data is null.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getPowerPlays('origin', 'drive', 'mask');

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_power_plays', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
      selected_public_mask: 'mask',
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

    const result = await getPowerPlays('origin', 'drive', 'mask');

    expect(rpcMock).toHaveBeenCalledWith('get_power_plays', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
      selected_public_mask: 'mask',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return array of power plays when data is available.', async () => {
    const mockData = [
      { power_play: 'Strategic Alliance' },
      { power_play: 'Direct Confrontation' },
      { power_play: 'Stealth Operation' },
    ];
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: mockData,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getPowerPlays('hero-origin', 'justice', 'defender');

    expect(rpcMock).toHaveBeenCalledWith('get_power_plays', {
      selected_origin_story: 'hero-origin',
      selected_core_drive: 'justice',
      selected_public_mask: 'defender',
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual(['Strategic Alliance', 'Direct Confrontation', 'Stealth Operation']);
  });

  it('Should return empty array in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));

    const result = await getPowerPlays('origin', 'drive', 'mask');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
