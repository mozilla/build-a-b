/**
 * Tests for useAssetPreloader hook
 *
 * Note: These are simplified integration tests. Image loading behavior
 * is primarily tested through manual testing and visual verification
 * in the browser with network throttling.
 */

import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { type AssetPreloadPriority, useAssetPreloader } from './use-asset-preloader';

// Mock Image to immediately trigger onload
class MockImage {
  onload: ((ev: Event) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  private _src = '';

  get src() {
    return this._src;
  }

  set src(value: string) {
    this._src = value;
    // Simulate successful load after a tiny delay
    setTimeout(() => {
      if (this.onload) {
        this.onload(new Event('load'));
      }
    }, 1);
  }

  decode(): Promise<void> {
    return Promise.resolve();
  }
}

describe('useAssetPreloader', () => {
  const originalImage = window.Image;

  beforeEach(() => {
    // Replace global Image with MockImage
    window.Image = MockImage as unknown as typeof Image;
  });

  afterEach(() => {
    // Restore original Image
    window.Image = originalImage;
  });

  it('should initialize with correct total asset count', () => {
    const assets: AssetPreloadPriority = {
      critical: ['critical1.webp', 'critical2.webp'],
      high: ['high1.webp'],
      medium: ['medium1.webp'],
      low: ['low1.webp'],
    };

    const { result } = renderHook(() => useAssetPreloader(assets, { enabled: true }));

    expect(result.current.totalAssets).toBe(5);
    expect(result.current.stats.critical.total).toBe(2);
    expect(result.current.stats.high.total).toBe(1);
    expect(result.current.stats.medium.total).toBe(1);
    expect(result.current.stats.low.total).toBe(1);
  });

  it('should not preload when disabled', () => {
    const assets: AssetPreloadPriority = {
      critical: ['critical1.webp'],
      high: [],
      medium: [],
      low: [],
    };

    const { result } = renderHook(() => useAssetPreloader(assets, { enabled: false }));

    // Should not have loaded anything
    expect(result.current.totalLoaded).toBe(0);
    // But should still report total assets
    expect(result.current.totalAssets).toBe(1);
  });

  it('should handle empty asset arrays', () => {
    const assets: AssetPreloadPriority = {
      critical: [],
      high: [],
      medium: [],
      low: [],
    };

    const { result } = renderHook(() => useAssetPreloader(assets, { enabled: true }));

    expect(result.current.totalAssets).toBe(0);
    expect(result.current.totalLoaded).toBe(0);
    expect(result.current.progress).toBe(0);
  });

  it('should handle mixed empty and non-empty priorities', () => {
    const assets: AssetPreloadPriority = {
      critical: ['c1.webp', 'c2.webp'],
      high: [],
      medium: ['m1.webp'],
      low: [],
    };

    const { result } = renderHook(() => useAssetPreloader(assets, { enabled: true }));

    expect(result.current.totalAssets).toBe(3);
    expect(result.current.stats.critical.total).toBe(2);
    expect(result.current.stats.high.total).toBe(0);
    expect(result.current.stats.medium.total).toBe(1);
    expect(result.current.stats.low.total).toBe(0);
  });

  it('should accept custom batch delay option', () => {
    const assets: AssetPreloadPriority = {
      critical: ['c1.webp'],
      high: ['h1.webp'],
      medium: [],
      low: [],
    };

    const { result } = renderHook(() =>
      useAssetPreloader(assets, { enabled: true, batchDelay: 100 }),
    );

    // Should initialize without errors
    expect(result.current).toBeDefined();
    expect(result.current.totalAssets).toBe(2);
  });

  it('should track loading with correct initial progress', () => {
    const assets: AssetPreloadPriority = {
      critical: ['c1.webp', 'c2.webp'],
      high: ['h1.webp', 'h2.webp'],
      medium: [],
      low: [],
    };

    const { result } = renderHook(() => useAssetPreloader(assets, { enabled: true }));

    // Initially 0% progress
    expect(result.current.progress).toBe(0);
    expect(result.current.totalLoaded).toBe(0);
  });
});
