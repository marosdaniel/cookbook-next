import '@testing-library/jest-dom';
import { IconFlame } from '@tabler/icons-react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '@/utils/test-utils';
import SectionTitle from './SectionTitle';

describe('SectionTitle', () => {
  it('renders section title with default order 2 and size h3', () => {
    render(<SectionTitle>Latest Recipes</SectionTitle>);

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Latest Recipes');
  });

  it('renders icon and rightSection when provided', () => {
    render(
      <SectionTitle
        icon={<IconFlame data-testid="title-icon" />}
        rightSection={<span data-testid="right-section">Count: 5</span>}
      >
        Featured
      </SectionTitle>,
    );

    expect(screen.getByTestId('title-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-section')).toBeInTheDocument();
  });
});
