import { trackEvent } from '../track-event';
import * as gtag from '../gtag';

jest.mock('../gtag', () => ({
  event: jest.fn(),
}));

describe('trackEvent', () => {
  let eventSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeAll(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  beforeEach(() => {
    eventSpy = jest.spyOn(gtag, 'event');
  });

  afterEach(() => {
    jest.clearAllMocks();
    warnSpy.mockClear();
  });

  afterAll(() => {
    warnSpy.mockRestore();
  });

  describe('Avatar events', () => {
    it('Should track avatar event with correct category.', () => {
      trackEvent({ action: 'click_get_started_cta' });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_get_started_cta',
        category: 'avatar_generator',
        label: 'get_started_cta',
      });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('Should track click_save_avatar event.', () => {
      trackEvent({ action: 'click_save_avatar' });

      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_save_avatar',
        category: 'avatar_generator',
        label: 'save_avatar',
      });
    });

    it('Should track click_download_avatar event.', () => {
      trackEvent({ action: 'click_download_avatar' });

      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_download_avatar',
        category: 'avatar_generator',
        label: 'download_avatar',
      });
    });
  });

  describe('Home events', () => {
    it('Should track home event with correct category.', () => {
      trackEvent({ action: 'click_twitchcon_details_cta' });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_twitchcon_details_cta',
        category: 'homepage',
        label: 'twitchcon_details_cta',
      });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('Should track click_firefox_owyw_logo event.', () => {
      trackEvent({ action: 'click_firefox_owyw_logo' });

      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_firefox_owyw_logo',
        category: 'homepage',
        label: 'firefox_owyw_logo',
      });
    });
  });

  describe('TwitchCon events', () => {
    it('Should track twitchcon event with correct category.', () => {
      trackEvent({ action: 'click_get_twitchcon_tickets' });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_get_twitchcon_tickets',
        category: 'twitchcon',
        label: 'get_twitchcon_tickets',
      });
      expect(warnSpy).not.toHaveBeenCalled();
    });
  });

  describe('Navigation events', () => {
    it('Should track navigation event with correct category.', () => {
      trackEvent({ action: 'click_bbo_logo_header' });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_bbo_logo_header',
        category: 'navigation',
        label: 'bbo_logo_header',
      });
      expect(warnSpy).not.toHaveBeenCalled();
    });

    it('Should track navigation event with platform when provided.', () => {
      trackEvent({ action: 'click_social_icon_header', platform: 'twitter' });

      expect(eventSpy).toHaveBeenCalledTimes(1);
      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_social_icon_header',
        category: 'navigation',
        label: 'social_icon_header_twitter',
      });
    });

    it('Should track navigation event without platform when not provided.', () => {
      trackEvent({ action: 'click_home_footer' });

      expect(eventSpy).toHaveBeenCalledWith({
        action: 'click_home_footer',
        category: 'navigation',
        label: 'home_footer',
      });
    });
  });

  describe('Unhandled events', () => {
    it('Should log warning for unhandled event.', () => {
      trackEvent({ action: 'invalid_event' as any });

      expect(eventSpy).not.toHaveBeenCalled();
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(warnSpy).toHaveBeenCalledWith('Unhandled GA event: invalid_event');
    });
  });
});
