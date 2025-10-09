import { createClient } from '../../supabase/server';
import { getOriginStories } from '../get-origin_stories';

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

describe('getOriginStories', () => {
  it('Should return empty array if data is null.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getOriginStories();

    expect(createClient).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('get_origin_stories');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return empty array if error occurs.', async () => {
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: null,
      error: { message: 'Database error' },
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getOriginStories();

    expect(rpcMock).toHaveBeenCalledWith('get_origin_stories');
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });

  it('Should return array of origin stories when data is available.', async () => {
    const mockData = [
      { origin_story: 'Tragic Loss' },
      { origin_story: 'Born Chosen' },
      { origin_story: 'Unlikely Hero' },
    ];
    const rpcMock = jest.fn().mockResolvedValueOnce({
      data: mockData,
      error: null,
    });
    (createClient as jest.Mock).mockResolvedValueOnce({ rpc: rpcMock });

    const result = await getOriginStories();

    expect(rpcMock).toHaveBeenCalledWith('get_origin_stories');
    expect(errorSpy).not.toHaveBeenCalled();
    expect(result).toEqual(['Tragic Loss', 'Born Chosen', 'Unlikely Hero']);
  });

  it('Should return empty array in case of unexpected failures.', async () => {
    (createClient as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));

    const result = await getOriginStories();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(result).toEqual([]);
  });
});
