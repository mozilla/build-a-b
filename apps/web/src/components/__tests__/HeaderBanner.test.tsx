import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderBanner from '../HeaderBanner';

describe('HeaderBanner', () => {
  it('renders the main heading correctly', () => {
    render(<HeaderBanner />);
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('#BillionaireBlastOff');
  });

  it('renders the alternative heading correctly', () => {
    render(<HeaderBanner />);
    const altHeading = screen.getByRole('heading', { level: 2 });
    expect(altHeading).toBeInTheDocument();
    expect(altHeading).toHaveTextContent('#OpenWhatYouWant');
  });

  it('renders Firefox logo with correct link', () => {
    render(<HeaderBanner />);
    const firefoxLink = screen.getByRole('link', { name: 'Firefox. Opens in a new window' });
    expect(firefoxLink).toBeInTheDocument();
    expect(firefoxLink).toHaveAttribute('href', 'https://www.mozilla.org/firefox/');
  });

  it('renders social media links with correct attributes', () => {
    render(<HeaderBanner />);
    const socialLinks = screen.getAllByRole('link', { name: /Visit our[\w\s]*/i });
    expect(socialLinks).toHaveLength(4);

    socialLinks.forEach((link) => {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  it('renders navigation links', () => {
    render(<HeaderBanner />);
    const navLinks = screen.getAllByRole('link', {
      name: /(Home|Twitchcon|Space Launch|Card Game)/i,
    });
    expect(navLinks).toHaveLength(4);
  });

  it('matches snapshot', () => {
    const { container } = render(<HeaderBanner />);
    expect(container).toMatchSnapshot();
  });
});
