import '@testing-library/jest-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '@/utils/test-utils';
import Template from './template';

describe('Root Template (Page Transition)', () => {
  it('renders children with transition container', () => {
    render(
      <Template>
        <div data-testid="page-child">Page Content</div>
      </Template>,
    );

    expect(screen.getByTestId('page-child')).toBeInTheDocument();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });
});
