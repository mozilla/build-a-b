/**
 * Data Grab Mini-Game Configuration
 * All timing and gameplay values for the Data Grab feature
 */

import BackgroundImage from '@/assets/backgrounds/color_nebula.webp';
import GridOverlay from '@/assets/special-effects/grid-blue.webp';
import CookieIcon from '@/assets/special-effects/cookie.webp';

export const DATA_GRAB_CONFIG = {
  // Trigger requirements
  MIN_CARDS_IN_PLAY: 1, // Minimum cards in play to trigger Data Grab

  // Timing (all in milliseconds)
  CARD_FALL_SPEED: 4500, // 3.5s for cards to fall from top to bottom

  // Visual elements
  COOKIE_COUNT: 4, // Number of floating data cookies
  BURST_DURATION: 1500, // Poof animation when card tapped

  // Animation
  TAKEOVER_DURATION: 2000, // Intro takeover animation
  HAND_VIEWER_MIN_DURATION: 1000, // Minimum time to show results
} as const;

/**
 * Data Grab Asset Paths
 * References to images and animations
 */
export const DATA_GRAB_ASSETS = {
  BACKGROUND_IMAGE: BackgroundImage, // Space/nebula background
  GRID_OVERLAY: GridOverlay, // Grid pattern overlay
  COOKIE_ICON: CookieIcon, // Data cookie icon
  POOF_ANIMATION: '/animations/poof.json', // Lottie poof effect (placeholder)
} as const;

/**
 * Data Grab Animation Keyframes
 * CSS animation configuration
 */
export const DATA_GRAB_ANIMATIONS = {
  GRID: {
    duration: '20s', // Grid animation duration
    timing: 'linear',
    direction: 'normal',
  },
  COOKIE_FLOAT: {
    duration: '8s', // Cookie float duration
    timing: 'ease-in-out',
    direction: 'alternate',
  },
} as const;

export type DataGrabConfig = typeof DATA_GRAB_CONFIG;
export type DataGrabAssets = typeof DATA_GRAB_ASSETS;
