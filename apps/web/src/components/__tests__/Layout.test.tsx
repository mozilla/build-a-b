import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Layout from '../Layout';

/**
 * Mock data for testing
 */
const TestContent = () => <div data-testid="test-content">Test Content</div>;

const TestChildren = [
  <div key="1" data-testid="child-1">
    Child 1
  </div>,
  <div key="2" data-testid="child-2">
    Child 1
  </div>,
  <TestContent key="3" />,
];

describe('Layout Component', () => {
  describe('Children Rendering', () => {
    it('should render a single child correctly', () => {
      render(
        <Layout>
          <TestContent />
        </Layout>,
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render multiple children correctly', () => {
      render(<Layout>{TestChildren}</Layout>);

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render empty children without errors', () => {
      const { container } = render(<Layout>{}</Layout>);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render null children without errors', () => {
      const { container } = render(<Layout>{null}</Layout>);

      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Full-Width Behavior', () => {
    it('should have full-width CSS classes', () => {
      const { container } = render(
        <Layout>
          <TestContent />
        </Layout>,
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('w-full');
      expect(mainElement).toHaveClass('min-h-screen');
    });

    it('should have flexbox layout classes', () => {
      const { container } = render(
        <Layout>
          <TestContent />
        </Layout>,
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('flex');
      expect(mainElement).toHaveClass('flex-col');
    });

    it('should have horizontal centering class', () => {
      const { container } = render(
        <Layout>
          <TestContent />
        </Layout>,
      );

      const mainElement = container.querySelector('main');
      expect(mainElement).toHaveClass('mx-auto');
    });
  });
});
