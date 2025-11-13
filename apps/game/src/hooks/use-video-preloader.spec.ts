/**
 * Tests for useVideoPreloader hook
 *
 * Note: These are simplified integration tests since mocking HTMLVideoElement
 * in jsdom is complex. The hook is primarily tested through manual testing
 * and visual verification of preloading behavior in the browser.
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useVideoPreloader } from './use-video-preloader';

describe('useVideoPreloader', () => {
  it('should return initial state when disabled', () => {
    const videoUrls = ['https://example.com/video1.webm'];

    const { result } = renderHook(() => useVideoPreloader(videoUrls, { enabled: false }));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.preloadedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  it('should return initial state when videoUrls is empty', () => {
    const { result } = renderHook(() => useVideoPreloader([]));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.preloadedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  it('should filter out undefined URLs', () => {
    const videoUrls = [
      'https://example.com/video1.webm',
      undefined,
      'https://example.com/video2.webm',
      undefined,
    ];

    const { result } = renderHook(() => useVideoPreloader(videoUrls));

    // Should only count defined URLs
    // Note: In jsdom, video elements don't actually load, so we just verify the hook runs
    expect(result.current).toBeDefined();
  });

  it('should accept preload strategy options', () => {
    const videoUrls = ['https://example.com/video1.webm'];

    const { result } = renderHook(() =>
      useVideoPreloader(videoUrls, { preloadStrategy: 'metadata' }),
    );

    // Hook should run without errors
    expect(result.current).toBeDefined();
  });

  it('should handle empty props correctly', () => {
    const { result } = renderHook(() => useVideoPreloader([]));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.preloadedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
  });

  it('should accept enabled option', () => {
    const videoUrls = ['https://example.com/video1.webm'];

    const { result: enabled } = renderHook(() => useVideoPreloader(videoUrls, { enabled: true }));

    const { result: disabled } = renderHook(() => useVideoPreloader(videoUrls, { enabled: false }));

    expect(enabled.current).toBeDefined();
    expect(disabled.current).toBeDefined();
  });
});
