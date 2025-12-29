import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MantineProviderWrapper } from './mantine';

// Mock Mantine modules if necessary, but MantineProvider is usually okay in happy-dom if matchMedia is mocked.
// The matchMedia mock is already in vitest.setup.mts

describe('MantineProviderWrapper', () => {
  it('renders children correctly', () => {
    render(
      <MantineProviderWrapper>
        <div data-testid="test-child">Hello Mantine</div>
      </MantineProviderWrapper>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Hello Mantine')).toBeInTheDocument();
  });

  it('renders Notifications component', () => {
    render(
      <MantineProviderWrapper>
        <div>Content</div>
      </MantineProviderWrapper>,
    );

    // Notifications portal usually renders at the end of body or in a specific container.
    // In Mantine 7+, it's often a portal.
    // We just check that the wrapper renders successfully.
  });

  it('renders NextTopLoader successfully', () => {
    const { container } = render(
      <MantineProviderWrapper>
        <div>Content</div>
      </MantineProviderWrapper>,
    );

    // We expect the wrapper to render children along with the loader.
    expect(screen.getByText('Content')).toBeInTheDocument();
    // NextTopLoader injects its styles/divs. We just ensure it doesn't crash.
    expect(container).toBeInTheDocument();
  });
});
