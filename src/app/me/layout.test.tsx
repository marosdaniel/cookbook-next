import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import MeLayout from './layout';

describe('MeLayout', () => {
  it('renders the container and children content', () => {
    render(
      <MeLayout>
        <div>profile content</div>
      </MeLayout>,
    );

    expect(screen.getByTestId('me-layout-container')).toBeInTheDocument();
    expect(screen.getByText('profile content')).toBeInTheDocument();
  });
});
