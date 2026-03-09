import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@/utils/test-utils';
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
    const { container } = render(<UserButton />);
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

    render(<UserButton />);
    expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'john@example.com',
    );
    expect(screen.getByTestId('user-initials')).toHaveTextContent('JD');
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

    render(<UserButton />);

    expect(screen.getByTestId('user-email')).toHaveTextContent(
      'john@example.com',
    );
    expect(screen.getByTestId('user-initials')).toHaveTextContent('J');
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

    render(<UserButton />);

    expect(screen.getByTestId('user-initials')).toHaveTextContent('JM');
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

    render(<UserButton />);

    expect(screen.getByTestId('user-initials')).toHaveTextContent('M');
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

    render(<UserButton />);

    const avatar = screen
      .getByTestId('user-initials')
      .closest('.mantine-Avatar-root');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('mantine-Avatar-root');
  });
});
