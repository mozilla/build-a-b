import { event } from '@/utils/helpers/gtag';

const avatarEvents = [
  'click_get_started_cta',
  'click_build_billionaire_footer',
  'click_build_billionaire_mobile_nav',
  'click_build_billionaire_countdown',
  'click_start_custom_avatar',
  'click_create_random_avatar',
  'click_restart_avatar',
  'click_save_avatar',
  'click_share_avatar',
  'click_download_avatar',
] as const;
export type AvatarEvent = (typeof avatarEvents)[number];

const homeEvents = [
  'click_twitchcon_page',
  'click_twitchcon_details_cta',
  'click_space_launch_details_cta',
  'click_firefox_owyw_logo',
] as const;
export type HomeEvent = (typeof homeEvents)[number];

const twitchconEvents = ['click_get_twitchcon_tickets'] as const;
export type TwitchConEvent = (typeof twitchconEvents)[number];

const navigationEvents = [
  'click_home_header',
  'click_home_footer',
  'click_twitchcon_header',
  'click_twitchcon_footer',
  'click_firefox_footer_logo',
  'click_social_icon_header',
  'click_social_icon_footer',
] as const;
export type NavigationEvent = (typeof navigationEvents)[number];

export type TrackableEvent = AvatarEvent | HomeEvent | TwitchConEvent | NavigationEvent;

interface TrackEventOptions {
  action: TrackableEvent;
  platform?: string; // optional, for things like social icons
}

/**
 * Centralized GA4 event tracker
 */
export function trackEvent({ action, platform }: TrackEventOptions) {
  // Avatar Generator
  if (avatarEvents.includes(action as AvatarEvent)) {
    event({
      action,
      category: 'avatar_generator',
      label: action.replace('click_', ''),
    });
    console.log({
      action,
      category: 'avatar_generator',
      label: action.replace('click_', ''),
    });
    return;
  }

  // Homepage events
  if (homeEvents.includes(action as HomeEvent)) {
    event({
      action,
      category: 'homepage',
      label: action.replace('click_', ''),
    });
    console.log({
      action,
      category: 'homepage',
      label: action.replace('click_', ''),
    });
    return;
  }

  // TwitchCon page
  if (twitchconEvents.includes(action as TwitchConEvent)) {
    event({
      action,
      category: 'twitchcon',
      label: action.replace('click_', ''),
    });
    console.log({
      action,
      category: 'twitchcon',
      label: action.replace('click_', ''),
    });
    return;
  }

  // Navigation events
  if (navigationEvents.includes(action as NavigationEvent)) {
    const label = action.replace('click_', '') + (platform ? `_${platform}` : '');
    event({
      action,
      category: 'navigation',
      label,
    });
    console.log({
      action,
      category: 'navigation',
      label,
    });
    return;
  }

  console.warn(`Unhandled GA event: ${action}`);
}
