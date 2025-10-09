import { GA_TRACKING_ID, pageview, event } from '../gtag';

describe('gtag', () => {
  let gtagMock: jest.Mock;

  beforeEach(() => {
    gtagMock = jest.fn();
    window.gtag = gtagMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete (window as { gtag: unknown }).gtag;
  });

  describe('pageview', () => {
    it('Should call window.gtag with correct parameters.', () => {
      pageview('/test-page');

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith('config', GA_TRACKING_ID, {
        page_path: '/test-page',
      });
    });

    it('Should not call window.gtag if gtag is undefined.', () => {
      delete (window as { gtag: unknown }).gtag;

      pageview('/test-page');

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });

  describe('event', () => {
    it('Should call window.gtag with all event parameters.', () => {
      event({
        action: 'click',
        category: 'button',
        label: 'submit',
        value: 1,
      });

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith('event', 'click', {
        event_category: 'button',
        event_label: 'submit',
        value: 1,
      });
    });

    it('Should call window.gtag with only required action parameter.', () => {
      event({ action: 'page_view' });

      expect(gtagMock).toHaveBeenCalledTimes(1);
      expect(gtagMock).toHaveBeenCalledWith('event', 'page_view', {
        event_category: undefined,
        event_label: undefined,
        value: undefined,
      });
    });

    it('Should not call window.gtag if gtag is undefined.', () => {
      delete (window as { gtag: unknown }).gtag;

      event({ action: 'click' });

      expect(gtagMock).not.toHaveBeenCalled();
    });
  });
});
