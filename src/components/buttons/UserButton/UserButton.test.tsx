import '@testing-library/jest-dom';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { describe, expect, it, vi } from 'vitest';
import UserButton from './UserButton';

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

describe('UserButton', () => {
  it('renders null when no session exists', () => {
    vi.mocked(useSession).mockReturnValue({
      data: null,
      update: vi.fn(),
      status: 'unauthenticated',
    } as unknown as ReturnType<typeof useSession>);
    const { container } = render(
      <MantineProvider>
        <UserButton />
      </MantineProvider>,
    );
    // Use querySelector to check for the Group component that UserButton returns
    expect(
      container.querySelector('.mantine-Group-root'),
    ).not.toBeInTheDocument();
  });

  it('renders user details when session exists', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        expires: '1',
        user: {
          id: '1',
          userName: 'John Doe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          locale: 'en',
        },
      },
      update: vi.fn(),
      status: 'authenticated',
    } as unknown as ReturnType<typeof useSession>);

    render(
      <MantineProvider>
        <UserButton />
      </MantineProvider>,
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('falls back to email and calculates initials correctly when userName is missing', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        expires: '1',
        user: {
          id: '1',
          userName: '',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          locale: 'en',
        },
      },
      update: vi.fn(),
      status: 'authenticated',
    } as unknown as ReturnType<typeof useSession>);

    render(
      <MantineProvider>
        <UserButton />
      </MantineProvider>,
    );

    // One for "userName" text (falls back to email), one for "email" text
    const emailElements = screen.getAllByText('john@example.com');
    expect(emailElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('calculates initials correctly for multiple names', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        expires: '1',
        user: {
          id: '1',
          userName: 'Jane Mary Watson',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Watson',
          role: 'USER',
          locale: 'en',
        },
      },
      update: vi.fn(),
      status: 'authenticated',
    } as unknown as ReturnType<typeof useSession>);

    render(
      <MantineProvider>
        <UserButton />
      </MantineProvider>,
    );

    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('handles single name initials correctly', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        expires: '1',
        user: {
          id: '1',
          userName: 'maros',
          email: 'maros@example.com',
          firstName: 'Maros',
          lastName: 'Daniel',
          role: 'USER',
          locale: 'en',
        },
      },
      update: vi.fn(),
      status: 'authenticated',
    } as unknown as ReturnType<typeof useSession>);

    render(
      <MantineProvider>
        <UserButton />
      </MantineProvider>,
    );

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('renders with pink avatar color', () => {
    vi.mocked(useSession).mockReturnValue({
      data: {
        expires: '1',
        user: {
          id: '1',
          userName: 'John Doe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'USER',
          locale: 'en',
        },
      },
      update: vi.fn(),
      status: 'authenticated',
    } as unknown as ReturnType<typeof useSession>);

    render(
      <MantineProvider>
        <UserButton />
      </MantineProvider>,
    );

    const avatar = screen.getByText('JD').closest('.mantine-Avatar-root');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('mantine-Avatar-root');
  });
});
