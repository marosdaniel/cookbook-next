import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import BackTo from './BackTo';

describe('BackTo', () => {
  it('renders the link and the text label', () => {
    render(
      <MantineProvider>
        <BackTo href="/recipes" text="Back to recipes" />
      </MantineProvider>,
    );

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', '/recipes');
    expect(links[1]).toHaveAttribute('href', '/recipes');
    expect(screen.getByText('Back to recipes')).toBeInTheDocument();
  });
});
