import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { StyledText } from './StyledText';

describe('StyledText', () => {
  describe('Text component type', () => {
    it('renders as Text component by default', () => {
      render(<StyledText>Test content</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent(
        'Test content',
      );
    });

    it('renders as Text component when componentType is explicitly "text"', () => {
      render(<StyledText componentType="text">Test content</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent(
        'Test content',
      );
    });

    it('renders text content correctly', () => {
      render(<StyledText>Hello World</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent(
        'Hello World',
      );
    });

    it('applies Text component props correctly', () => {
      render(
        <StyledText size="xl" fw={700} c="blue">
          Styled text
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Styled text');
    });
  });

  describe('Title component type', () => {
    it('renders as Title component when componentType is "title"', () => {
      const { container } = render(
        <StyledText componentType="title">Test Title</StyledText>,
      );
      expect(screen.getByTestId('styled-text')).toHaveTextContent('Test Title');
      const titleElement = container.querySelector('.mantine-Title-root');
      expect(titleElement).toBeInTheDocument();
    });

    it('renders title content correctly', () => {
      render(<StyledText componentType="title">Main Title</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent('Main Title');
    });

    it('applies Title component props correctly', () => {
      render(
        <StyledText componentType="title" order={1} c="red">
          Page Title
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element).toBeInTheDocument();
      expect(element).toHaveTextContent('Page Title');
    });

    it('applies different title orders', () => {
      render(
        <>
          <StyledText componentType="title" order={1}>
            H1 Title
          </StyledText>
          <StyledText componentType="title" order={2}>
            H2 Title
          </StyledText>
          <StyledText componentType="title" order={3}>
            H3 Title
          </StyledText>
        </>,
      );
      const titleElements = screen.getAllByTestId('styled-text');
      expect(titleElements[0]).toHaveTextContent('H1 Title');
      expect(titleElements[1]).toHaveTextContent('H2 Title');
      expect(titleElements[2]).toHaveTextContent('H3 Title');
    });
  });

  describe('Gradient styling', () => {
    it('does not apply gradient class by default', () => {
      render(<StyledText>No gradient</StyledText>);
      const element = screen.getByTestId('styled-text');
      expect(element.className).not.toContain('gradientText');
    });

    it('applies gradient class when gradient prop is true for Text', () => {
      render(<StyledText gradient={true}>Gradient text</StyledText>);
      const element = screen.getByTestId('styled-text');
      expect(element.className).toContain('gradientText');
    });

    it('applies gradient class when gradient prop is true for Title', () => {
      render(
        <StyledText componentType="title" gradient={true}>
          Gradient title
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element.className).toContain('gradientText');
    });

    it('does not apply gradient class when gradient is false', () => {
      render(<StyledText gradient={false}>No gradient</StyledText>);
      const element = screen.getByTestId('styled-text');
      expect(element.className).not.toContain('gradientText');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to Text component', () => {
      render(<StyledText className="custom-class">Custom styled</StyledText>);
      const element = screen.getByTestId('styled-text');
      expect(element.className).toContain('custom-class');
    });

    it('applies custom className to Title component', () => {
      render(
        <StyledText componentType="title" className="custom-title">
          Custom title
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element.className).toContain('custom-title');
    });

    it('combines custom className with gradient class', () => {
      render(
        <StyledText gradient={true} className="custom-class">
          Combined classes
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element.className).toContain('custom-class');
      expect(element.className).toContain('gradientText');
    });

    it('applies multiple custom classes', () => {
      render(
        <StyledText className="class-one class-two">
          Multiple classes
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element.className).toContain('class-one');
      expect(element.className).toContain('class-two');
    });
  });

  describe('Combined props', () => {
    it('combines all props correctly for Text', () => {
      render(
        <StyledText
          componentType="text"
          gradient={true}
          className="combined"
          size="lg"
          fw={600}
        >
          Combined text
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element).toBeInTheDocument();
      expect(element.className).toContain('combined');
      expect(element.className).toContain('gradientText');
    });

    it('combines all props correctly for Title', () => {
      render(
        <StyledText
          componentType="title"
          gradient={true}
          className="combined-title"
          order={2}
        >
          Combined title
        </StyledText>,
      );
      const element = screen.getByTestId('styled-text');
      expect(element).toBeInTheDocument();
      expect(element.className).toContain('combined-title');
      expect(element.className).toContain('gradientText');
    });
  });

  describe('Children rendering', () => {
    it('renders string children', () => {
      render(<StyledText>String content</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent(
        'String content',
      );
    });

    it('renders number children', () => {
      render(<StyledText>{42}</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent('42');
    });

    it('renders multiple children', () => {
      render(
        <StyledText>
          Multiple <strong>children</strong> elements
        </StyledText>,
      );
      expect(screen.getByTestId('styled-text')).toHaveTextContent(/Multiple/);
      expect(screen.getByTestId('styled-text')).toHaveTextContent('children');
    });
  });

  describe('Edge cases', () => {
    it('handles empty children', () => {
      const { container } = render(<StyledText></StyledText>);
      const textElement = container.querySelector('.mantine-Text-root');
      expect(textElement).toBeInTheDocument();
    });

    it('handles null className gracefully', () => {
      render(<StyledText className={undefined}>Text</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent('Text');
    });

    it('renders with all default props', () => {
      render(<StyledText>Default props</StyledText>);
      expect(screen.getByTestId('styled-text')).toHaveTextContent(
        'Default props',
      );
    });
  });
});
