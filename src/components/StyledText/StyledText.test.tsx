import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StyledText } from './StyledText';

describe('StyledText', () => {
  const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>);
  };

  describe('Text component type', () => {
    it('renders as Text component by default', () => {
      renderWithMantine(<StyledText>Test content</StyledText>);
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders as Text component when componentType is explicitly "text"', () => {
      renderWithMantine(
        <StyledText componentType="text">Test content</StyledText>,
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders text content correctly', () => {
      renderWithMantine(<StyledText>Hello World</StyledText>);
      expect(screen.getByText('Hello World')).toBeInTheDocument();
    });

    it('applies Text component props correctly', () => {
      renderWithMantine(
        <StyledText size="xl" fw={700} c="blue">
          Styled text
        </StyledText>,
      );
      const element = screen.getByText('Styled text');
      expect(element).toBeInTheDocument();
    });
  });

  describe('Title component type', () => {
    it('renders as Title component when componentType is "title"', () => {
      const { container } = renderWithMantine(
        <StyledText componentType="title">Test Title</StyledText>,
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      const titleElement = container.querySelector('.mantine-Title-root');
      expect(titleElement).toBeInTheDocument();
    });

    it('renders title content correctly', () => {
      renderWithMantine(
        <StyledText componentType="title">Main Title</StyledText>,
      );
      expect(screen.getByText('Main Title')).toBeInTheDocument();
    });

    it('applies Title component props correctly', () => {
      renderWithMantine(
        <StyledText componentType="title" order={1} c="red">
          Page Title
        </StyledText>,
      );
      const element = screen.getByText('Page Title');
      expect(element).toBeInTheDocument();
    });

    it('applies different title orders', () => {
      renderWithMantine(
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
      expect(screen.getByText('H1 Title')).toBeInTheDocument();
      expect(screen.getByText('H2 Title')).toBeInTheDocument();
      expect(screen.getByText('H3 Title')).toBeInTheDocument();
    });
  });

  describe('Gradient styling', () => {
    it('does not apply gradient class by default', () => {
      renderWithMantine(<StyledText>No gradient</StyledText>);
      const element = screen.getByText('No gradient');
      expect(element.className).not.toContain('gradientText');
    });

    it('applies gradient class when gradient prop is true for Text', () => {
      renderWithMantine(<StyledText gradient={true}>Gradient text</StyledText>);
      const element = screen.getByText('Gradient text');
      expect(element.className).toContain('gradientText');
    });

    it('applies gradient class when gradient prop is true for Title', () => {
      renderWithMantine(
        <StyledText componentType="title" gradient={true}>
          Gradient title
        </StyledText>,
      );
      const element = screen.getByText('Gradient title');
      expect(element.className).toContain('gradientText');
    });

    it('does not apply gradient class when gradient is false', () => {
      renderWithMantine(<StyledText gradient={false}>No gradient</StyledText>);
      const element = screen.getByText('No gradient');
      expect(element.className).not.toContain('gradientText');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to Text component', () => {
      renderWithMantine(
        <StyledText className="custom-class">Custom styled</StyledText>,
      );
      const element = screen.getByText('Custom styled');
      expect(element.className).toContain('custom-class');
    });

    it('applies custom className to Title component', () => {
      renderWithMantine(
        <StyledText componentType="title" className="custom-title">
          Custom title
        </StyledText>,
      );
      const element = screen.getByText('Custom title');
      expect(element.className).toContain('custom-title');
    });

    it('combines custom className with gradient class', () => {
      renderWithMantine(
        <StyledText gradient={true} className="custom-class">
          Combined classes
        </StyledText>,
      );
      const element = screen.getByText('Combined classes');
      expect(element.className).toContain('custom-class');
      expect(element.className).toContain('gradientText');
    });

    it('applies multiple custom classes', () => {
      renderWithMantine(
        <StyledText className="class-one class-two">
          Multiple classes
        </StyledText>,
      );
      const element = screen.getByText('Multiple classes');
      expect(element.className).toContain('class-one');
      expect(element.className).toContain('class-two');
    });
  });

  describe('Combined props', () => {
    it('combines all props correctly for Text', () => {
      renderWithMantine(
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
      const element = screen.getByText('Combined text');
      expect(element).toBeInTheDocument();
      expect(element.className).toContain('combined');
      expect(element.className).toContain('gradientText');
    });

    it('combines all props correctly for Title', () => {
      renderWithMantine(
        <StyledText
          componentType="title"
          gradient={true}
          className="combined-title"
          order={2}
        >
          Combined title
        </StyledText>,
      );
      const element = screen.getByText('Combined title');
      expect(element).toBeInTheDocument();
      expect(element.className).toContain('combined-title');
      expect(element.className).toContain('gradientText');
    });
  });

  describe('Children rendering', () => {
    it('renders string children', () => {
      renderWithMantine(<StyledText>String content</StyledText>);
      expect(screen.getByText('String content')).toBeInTheDocument();
    });

    it('renders number children', () => {
      renderWithMantine(<StyledText>{42}</StyledText>);
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      renderWithMantine(
        <StyledText>
          Multiple <strong>children</strong> elements
        </StyledText>,
      );
      expect(screen.getByText(/Multiple/)).toBeInTheDocument();
      expect(screen.getByText('children')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles empty children', () => {
      const { container } = renderWithMantine(<StyledText></StyledText>);
      const textElement = container.querySelector('.mantine-Text-root');
      expect(textElement).toBeInTheDocument();
    });

    it('handles null className gracefully', () => {
      renderWithMantine(<StyledText className={undefined}>Text</StyledText>);
      expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('renders with all default props', () => {
      renderWithMantine(<StyledText>Default props</StyledText>);
      expect(screen.getByText('Default props')).toBeInTheDocument();
    });
  });
});
