import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PUBLIC_ROUTES } from '../../../types/routes';
import BackTo from './BackTo';

describe('BackTo', () => {
  it('renders the link and the text label', () => {
    render(
      <MantineProvider>
        <BackTo href={PUBLIC_ROUTES.RECIPES} text="Back to recipes" />
      </MantineProvider>,
    );

    const links = screen.getAllByRole('link');

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', PUBLIC_ROUTES.RECIPES);
    expect(links[1]).toHaveAttribute('href', PUBLIC_ROUTES.RECIPES);
    expect(screen.getByTestId('back-to-text')).toHaveTextContent(
      'Back to recipes',
    );
  });
});
