import { COOKIE_NAME } from '../../constants';
import { isAvatarSaved } from '../is-avatar-saved';
import { cookies } from 'next/headers';

jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({ get: jest.fn(() => ({})) }),
}));

describe('isAvatarSaved', () => {
  it('Should return false if cookie is not set.', async () => {
    const getMock = jest.fn(() => undefined);
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await isAvatarSaved();

    expect(cookies).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(result).toBe(false);
  });

  it('Should return false if cookie value is empty string.', async () => {
    const getMock = jest.fn(() => ({ value: '' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await isAvatarSaved();

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(result).toBe(false);
  });

  it('Should return true if cookie has a value.', async () => {
    const getMock = jest.fn(() => ({ value: '1234' }));
    (cookies as jest.Mock).mockResolvedValueOnce({ get: getMock });

    const result = await isAvatarSaved();

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(getMock).toHaveBeenCalledWith(COOKIE_NAME);
    expect(result).toBe(true);
  });

  it('Should call console.error and rethrow in case of unexpected failures.', async () => {
    (cookies as jest.Mock).mockRejectedValueOnce(new Error('Something failed'));
    await expect(isAvatarSaved()).rejects.toThrow();
  });
});
