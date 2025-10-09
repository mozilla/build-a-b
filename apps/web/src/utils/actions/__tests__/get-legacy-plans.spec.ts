import { createClient } from '../../supabase/server';
import { getLegacyPlans } from '../get-legacy-plans';

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

describe('getLegacyPlans', () => {
  it('Should return empty array if data is null.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getLegacyPlans('origin', 'drive', 'mask', 'play');

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_legacy_plans', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
      selected_public_mask: 'mask',
      selected_power_play: 'play',
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

    const result = await getLegacyPlans('origin', 'drive', 'mask', 'play');

    expect(rpcMock).toHaveBeenCalledWith('get_legacy_plans', {
      selected_origin_story: 'origin',
      selected_core_drive: 'drive',
      selected_public_mask: 'mask',
      selected_power_play: 'play',
    });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return array of legacy plans when data is available.', async () => {
    const mockData = [
      { legacy_plan: 'Plan A' },
      { legacy_plan: 'Plan B' },
      { legacy_plan: 'Plan C' },
    ];
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: mockData,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getLegacyPlans('hero-origin', 'justice', 'defender', 'strategy');

    expect(rpcMock).toHaveBeenCalledWith('get_legacy_plans', {
      selected_origin_story: 'hero-origin',
      selected_core_drive: 'justice',
      selected_public_mask: 'defender',
      selected_power_play: 'strategy',
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual(['Plan A', 'Plan B', 'Plan C']);
  });

  it('Should return empty array in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));

    const result = await getLegacyPlans('origin', 'drive', 'mask', 'play');

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
