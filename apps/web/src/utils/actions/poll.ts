import type { StatusEndpointBaseResponse } from '@/types';

export async function pollStatus<T extends StatusEndpointBaseResponse>(
  jobId: string,
  api: 'selfie' | 'avatar',
  maxRetries = 15,
  initialDelay = 2000,
): Promise<T | null> {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      const response = await fetch(
        `https://mozilla-billionaires.mndo.to/api/${api}/status/${jobId}`,
        { method: 'GET' },
      );

      const result: T = await response.json();

      if (result?.status === 'completed') {
        return result;
      }

      if (result.status === 'failed' || result.status === 'error') {
        throw new Error(`Job failed. Could not generate a selfie.`);
      }

      // Job is still processing, wait before next poll
      if (result.status === 'processing' || result.status === 'pending') {
        await new Promise((resolve) => setTimeout(resolve, delay));
        retries++;
        // Exponential backoff with max delay of 5 seconds
        delay = Math.min(delay * 1.2, 5000);
        continue;
      }

      // Unexpected status
      throw new Error(`Unexpected job status: ${result.status}`);
    } catch (error) {
      if (retries === maxRetries - 1) {
        throw error;
      }

      // Wait before retry on network errors
      await new Promise((resolve) => setTimeout(resolve, delay));
      retries++;
      delay = Math.min(delay * 1.2, 5000);
    }
  }

  return null; // Timed out
}
