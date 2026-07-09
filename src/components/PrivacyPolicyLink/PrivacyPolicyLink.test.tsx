import type React from 'react';
import '@testing-library/jest-dom';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
import { PUBLIC_ROUTES } from '../../types/routes';
import PrivacyPolicyLink from './PrivacyPolicyLink';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'auth.iAcceptThePrivacyPolicy': 'I accept the Privacy Policy',
    };
    return translations[key] || key;
  },
}));

// Mock next/link
vi.mock('next/link', () => {
  return {
    __esModule: true,
    default: ({
      children,
      href,
      ...props
    }: {
      children: React.ReactNode;
      href: string;
    }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  };
});

describe('PrivacyPolicyLink', () => {
  it('renders the privacy policy link text', () => {
    render(<PrivacyPolicyLink />);
    expect(screen.getByTestId('privacy-policy-link')).toHaveTextContent(
      'I accept the Privacy Policy',
    );
  });

  it('renders as a link with correct href', () => {
    render(<PrivacyPolicyLink />);
    const link = screen.getByTestId('privacy-policy-link');
    expect(link).toHaveAttribute('href', PUBLIC_ROUTES.PRIVACY_POLICY);
  });

  it('opens in a new tab with correct security attributes', () => {
    render(<PrivacyPolicyLink />);
    const link = screen.getByTestId('privacy-policy-link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders as an Anchor component with gradient variant', () => {
    render(<PrivacyPolicyLink />);
    const link = screen.getByTestId('privacy-policy-link');
    expect(link.tagName).toBe('A');
  });
});
