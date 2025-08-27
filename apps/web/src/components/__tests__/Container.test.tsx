import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Container from '../Container';

/**
 * Mock data for testing
 */
const TestContent = () => <div data-testid="test-content">Test Content</div>;
const TestChildren = [
  <div key="1" data-testid="child-1">
    Child 1
  </div>,
  <div key="2" data-testid="child-2">
    Child 2
  </div>,
  <TestContent key="3" />,
];

describe('Container Component', () => {
  describe('Children Rendering', () => {
    it('should render a single child correctly', () => {
      render(
        <Container>
          <TestContent />
        </Container>,
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render multiple children correctly', () => {
      render(<Container>{TestChildren}</Container>);

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('should render empty children without errors', () => {
      const { container } = render(<Container>{}</Container>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render null children without errors', () => {
      const { container } = render(<Container>{null}</Container>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
