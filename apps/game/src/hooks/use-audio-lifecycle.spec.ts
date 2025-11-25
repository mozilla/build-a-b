/**
 * Tests for useAudioLifecycle hook
 */

import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAudioLifecycle } from './use-audio-lifecycle';

describe('useAudioLifecycle', () => {
  let mockMusicChannel: HTMLAudioElement;
  let mockSfxChannel1: HTMLAudioElement;
  let mockSfxChannel2: HTMLAudioElement;

  beforeEach(() => {
    // Create mock audio elements
    mockMusicChannel = {
      paused: false,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
    } as unknown as HTMLAudioElement;

    mockSfxChannel1 = {
      paused: false,
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
    } as unknown as HTMLAudioElement;

    mockSfxChannel2 = {
      paused: true, // Already paused
      pause: vi.fn(),
      play: vi.fn().mockResolvedValue(undefined),
    } as unknown as HTMLAudioElement;

    // Mock document.visibilityState
    Object.defineProperty(document, 'visibilityState', {
      writable: true,
      configurable: true,
      value: 'visible',
    });
  });

  describe('visibilitychange event', () => {
    it('should pause music when page becomes hidden', () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [mockSfxChannel1, mockSfxChannel2],
        }),
      );

      // Simulate page becoming hidden
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockMusicChannel.pause).toHaveBeenCalledTimes(1);
    });

    it('should pause all active SFX channels when page becomes hidden', () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [mockSfxChannel1, mockSfxChannel2],
        }),
      );

      // Simulate page becoming hidden
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockSfxChannel1.pause).toHaveBeenCalledTimes(1);
      expect(mockSfxChannel2.pause).not.toHaveBeenCalled(); // Already paused
    });

    it('should resume music when page becomes visible if system paused it', async () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [mockSfxChannel1],
        }),
      );

      // Simulate page becoming hidden (system pauses)
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      // Simulate page becoming visible
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));

      // Wait for async play() call
      await vi.waitFor(() => {
        expect(mockMusicChannel.play).toHaveBeenCalledTimes(1);
      });
    });

    it('should NOT resume music if user had manually paused it', async () => {
      // Music starts already paused (user paused it)
      const pausedMusicChannel = {
        paused: true,
        pause: vi.fn(),
        play: vi.fn().mockResolvedValue(undefined),
      } as unknown as HTMLAudioElement;

      renderHook(() =>
        useAudioLifecycle({
          musicChannel: pausedMusicChannel,
          sfxChannels: [],
        }),
      );

      // Simulate page becoming hidden (music already paused, so system doesn't pause it)
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      // Simulate page becoming visible
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));

      // Wait a bit to ensure play() is not called
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(pausedMusicChannel.play).not.toHaveBeenCalled();
    });

    it('should handle play() being rejected (autoplay policy)', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockMusicChannel.play = vi.fn().mockRejectedValue(new Error('Autoplay blocked'));

      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [],
        }),
      );

      // System pauses
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      // Try to resume
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));

      await vi.waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Auto-resume blocked'),
          expect.any(Error),
        );
      });

      consoleWarnSpy.mockRestore();
    });

    it('should handle null music channel gracefully', () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: null,
          sfxChannels: [mockSfxChannel1],
        }),
      );

      // Should not throw when music channel is null
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      expect(() => document.dispatchEvent(new Event('visibilitychange'))).not.toThrow();

      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      expect(() => document.dispatchEvent(new Event('visibilitychange'))).not.toThrow();
    });

    it('should handle empty SFX channels array', () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [],
        }),
      );

      // Should not throw with empty SFX array
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      expect(() => document.dispatchEvent(new Event('visibilitychange'))).not.toThrow();
    });
  });

  describe('pagehide event', () => {
    it('should pause all audio on pagehide (zombie audio prevention)', () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [mockSfxChannel1, mockSfxChannel2],
        }),
      );

      // Simulate page hide (force quit, navigate away)
      window.dispatchEvent(new Event('pagehide'));

      expect(mockMusicChannel.pause).toHaveBeenCalledTimes(1);
      expect(mockSfxChannel1.pause).toHaveBeenCalledTimes(1);
      expect(mockSfxChannel2.pause).toHaveBeenCalledTimes(1);
    });

    it('should handle null channels on pagehide', () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: null,
          sfxChannels: [null, mockSfxChannel1, null],
        }),
      );

      // Should not throw
      expect(() => window.dispatchEvent(new Event('pagehide'))).not.toThrow();
      expect(mockSfxChannel1.pause).toHaveBeenCalledTimes(1);
    });
  });

  describe('cleanup', () => {
    it('should remove event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const windowRemoveEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [],
        }),
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function),
      );
      expect(windowRemoveEventListenerSpy).toHaveBeenCalledWith('pagehide', expect.any(Function));

      removeEventListenerSpy.mockRestore();
      windowRemoveEventListenerSpy.mockRestore();
    });
  });

  describe('debug mode', () => {
    it('should log messages when debug is enabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [],
          debug: true,
        }),
      );

      // Check that at least one log call contains [AudioLifecycle]
      const audioLifecycleCalls = consoleLogSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('[AudioLifecycle]')),
      );

      expect(audioLifecycleCalls.length).toBeGreaterThan(0);

      consoleLogSpy.mockRestore();
    });

    it('should NOT log messages when debug is disabled', () => {
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [],
          // debug defaults to false
        }),
      );

      // Should not have any AudioLifecycle log calls
      const audioLifecycleCalls = consoleLogSpy.mock.calls.filter((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('[AudioLifecycle]')),
      );

      expect(audioLifecycleCalls.length).toBe(0);

      consoleLogSpy.mockRestore();
    });
  });

  describe('real-world scenarios', () => {
    it('should handle rapid visibility changes (tab switching)', async () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [],
        }),
      );

      // Rapid tab switches
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));

      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));

      // Should handle gracefully without errors
      expect(mockMusicChannel.pause).toHaveBeenCalled();
      await vi.waitFor(() => {
        expect(mockMusicChannel.play).toHaveBeenCalled();
      });
    });

    it('should simulate iOS phone call interruption', async () => {
      renderHook(() =>
        useAudioLifecycle({
          musicChannel: mockMusicChannel,
          sfxChannels: [mockSfxChannel1],
        }),
      );

      // Phone call comes in - iOS fires visibilitychange
      Object.defineProperty(document, 'visibilityState', { value: 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));

      expect(mockMusicChannel.pause).toHaveBeenCalledTimes(1);
      expect(mockSfxChannel1.pause).toHaveBeenCalledTimes(1);

      // Phone call ends - page becomes visible again
      Object.defineProperty(document, 'visibilityState', { value: 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));

      await vi.waitFor(() => {
        expect(mockMusicChannel.play).toHaveBeenCalledTimes(1);
      });
    });
  });
});
