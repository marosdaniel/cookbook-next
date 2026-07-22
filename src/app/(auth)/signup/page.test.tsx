import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import SignUpPage from './page';

vi.mock('@/lib/locale/locale.server', () => ({
  getLocaleFromCookies: vi.fn().mockResolvedValue('en'),
}));

vi.mock('@/lib/seo/seo', () => ({
  getMetadata: vi.fn().mockReturnValue({
    title: 'Register',
    description: 'Create your account',
  }),
}));

vi.mock('./SignUpForm', () => ({
  default: () => <div data-testid="signup-page-form">signup form</div>,
}));

describe('SignUpPage', () => {
  it('renders the signup form and metadata factory is invoked', () => {
    render(<SignUpPage />);

    expect(screen.getByTestId('signup-page-form')).toBeInTheDocument();
  });
});
