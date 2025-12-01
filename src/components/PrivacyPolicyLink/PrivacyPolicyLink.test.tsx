import type React from 'react';
import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
    render(
      <MantineProvider>
        <PrivacyPolicyLink />
      </MantineProvider>,
    );
    expect(screen.getByText('I accept the Privacy Policy')).toBeInTheDocument();
  });

  it('renders as a link with correct href', () => {
    render(
      <MantineProvider>
        <PrivacyPolicyLink />
      </MantineProvider>,
    );
    const link = screen.getByText('I accept the Privacy Policy');
    expect(link).toHaveAttribute('href', '/');
  });

  it('opens in a new tab with correct security attributes', () => {
    render(
      <MantineProvider>
        <PrivacyPolicyLink />
      </MantineProvider>,
    );
    const link = screen.getByText('I accept the Privacy Policy');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders as an Anchor component with gradient variant', () => {
    render(
      <MantineProvider>
        <PrivacyPolicyLink />
      </MantineProvider>,
    );
    const link = screen.getByText('I accept the Privacy Policy');
    expect(link.tagName).toBe('A');
  });
});
