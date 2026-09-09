import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ServerProviders from './server';

describe('ServerProviders', () => {
  it('passes children through unchanged', () => {
    render(
      <ServerProviders>
        <div data-testid="server-child">Content</div>
      </ServerProviders>,
    );

    expect(screen.getByTestId('server-child')).toHaveTextContent('Content');
  });
});
