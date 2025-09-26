/**
 * @jest-environment node
 */

import { generateAvatarSelfie } from '../generate-avatar-selfie';
import { createClient } from '../../supabase/server';
import { pollStatus } from '../poll';
import { cookies } from 'next/headers';

// Mock dependencies
jest.mock('../../supabase/server');
jest.mock('../poll');
jest.mock('next/headers');

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>;
const mockPollStatus = pollStatus as jest.MockedFunction<typeof pollStatus>;
const mockCookies = cookies as jest.MockedFunction<typeof cookies>;

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock console.error to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('generateAvatarSelfie', () => {
  const mockSupabase = {
    rpc: jest.fn(),
    from: jest.fn(),
  };

  const mockCookieStore = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockCookies.mockResolvedValue(mockCookieStore);
    mockCookieStore.get.mockReturnValue({ value: 'test-uuid' });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  it('should generate avatar selfie successfully', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: 'https://example.com/standing.png',
    };

    const mockSelfieResponse = {
      job_id: 'job-123',
    };

    const mockGeneratedSelfie = {
      selfie_image_url: 'https://example.com/selfie.jpg',
      status: 'completed',
    };

    // Mock RPC call
    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    // Mock fetch for selfie generation
    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockSelfieResponse),
    } as any);

    // Mock polling
    mockPollStatus.mockResolvedValue(mockGeneratedSelfie);

    // Mock selfies insert
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    });

    const result = await generateAvatarSelfie();

    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_avatar_standing_asset_by_user_uuid', {
      user_uuid: 'test-uuid',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://mozilla-billionaires.mndo.to/api/selfie/generate',
      {
        method: 'POST',
        body: JSON.stringify({ input_path: 'https://example.com/standing.png' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      }
    );
    expect(mockPollStatus).toHaveBeenCalledWith('job-123', 'selfie');
    expect(mockSupabase.from).toHaveBeenCalledWith('selfies');
    expect(result).toBe('https://example.com/selfie.jpg');
  });

  it('should handle asset_standing with trailing question mark', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: 'https://example.com/standing.png?',
    };

    const mockSelfieResponse = {
      job_id: 'job-123',
    };

    const mockGeneratedSelfie = {
      selfie_image_url: 'https://example.com/selfie.jpg',
      status: 'completed',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockSelfieResponse),
    } as any);

    mockPollStatus.mockResolvedValue(mockGeneratedSelfie);

    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({
        error: null,
      }),
    });

    const result = await generateAvatarSelfie();

    expect(mockFetch).toHaveBeenCalledWith(
      'https://mozilla-billionaires.mndo.to/api/selfie/generate',
      {
        method: 'POST',
        body: JSON.stringify({ input_path: 'https://example.com/standing.png' }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      }
    );
    expect(result).toBe('https://example.com/selfie.jpg');
  });

  it('should throw error when no UUID in cookies', async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    await expect(generateAvatarSelfie()).rejects.toThrow('No UUID stored when trying to create a selfie.');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should throw error when no avatar data found', async () => {
    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    });

    await expect(generateAvatarSelfie()).rejects.toThrow("No avatar associated to the user, can't create a selfie.");
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should throw error when no asset_standing found', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: null,
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    await expect(generateAvatarSelfie()).rejects.toThrow('Could not retrieve avatar data when trying to create a selfie.');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should throw error when job cannot be started', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: 'https://example.com/standing.png',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({}), // No job_id
    } as any);

    await expect(generateAvatarSelfie()).rejects.toThrow('Job could not be started when trying to generate a selfie.');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should throw error when polling fails', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: 'https://example.com/standing.png',
    };

    const mockSelfieResponse = {
      job_id: 'job-123',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockSelfieResponse),
    } as any);

    mockPollStatus.mockResolvedValue(null); // Polling failed

    await expect(generateAvatarSelfie()).rejects.toThrow('Selfie generation failed or timed out.');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should throw error when selfie generation returns no image URL', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: 'https://example.com/standing.png',
    };

    const mockSelfieResponse = {
      job_id: 'job-123',
    };

    const mockGeneratedSelfie = {
      selfie_image_url: null, // No image URL
      status: 'completed',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockSelfieResponse),
    } as any);

    mockPollStatus.mockResolvedValue(mockGeneratedSelfie);

    await expect(generateAvatarSelfie()).rejects.toThrow('Selfie generation failed or timed out.');
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should throw error when database insertion fails', async () => {
    const mockAvatarData = {
      user_id: 1,
      avatar_id: 123,
      asset_standing: 'https://example.com/standing.png',
    };

    const mockSelfieResponse = {
      job_id: 'job-123',
    };

    const mockGeneratedSelfie = {
      selfie_image_url: 'https://example.com/selfie.jpg',
      status: 'completed',
    };

    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: mockAvatarData,
        error: null,
      }),
    });

    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockSelfieResponse),
    } as any);

    mockPollStatus.mockResolvedValue(mockGeneratedSelfie);

    // Mock database error
    const dbError = new Error('Database insertion failed');
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockResolvedValue({
        error: dbError,
      }),
    });

    await expect(generateAvatarSelfie()).rejects.toThrow(dbError);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle RPC error', async () => {
    mockSupabase.rpc.mockReturnValue({
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'RPC failed' },
      }),
    });

    await expect(generateAvatarSelfie()).rejects.toThrow("No avatar associated to the user, can't create a selfie.");
    expect(consoleSpy).toHaveBeenCalled();
  });
});