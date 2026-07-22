import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ActionIcon,
  Button,
  Group,
  Paper,
  RingProgress,
  Stack,
  Text,
  Title,
  Tooltip,
} from '../../../../../../__mocks__/@mantine/core';
import ComposerHeader from './ComposerHeader';

vi.mock('@mantine/core', () => ({
  ActionIcon: ActionIcon,
  Button: Button,
  Group: Group,
  Paper: Paper,
  RingProgress: RingProgress,
  Stack: Stack,
  Text: Text,
  Title: Title,
  Tooltip: Tooltip,
}));

vi.mock('motion/react', () => ({
  AnimatePresence: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ComposerHeader', () => {
  it('renders progress details and triggers header actions', () => {
    const onBack = vi.fn();
    const onSave = vi.fn();
    const onPreview = vi.fn();
    const onPublish = vi.fn();

    render(
      <ComposerHeader
        title="My recipe"
        onBack={onBack}
        completion={{ done: 3, total: 4, percent: 75 }}
        lastSavedLabel="Saved 2 min ago"
        onSave={onSave}
        onPreview={onPreview}
        onPublish={onPublish}
        publishLoading={false}
        submitLabel="Publish recipe"
        isPublishDisabled={false}
        publishTooltip="Ready"
      />,
    );

    expect(screen.getByTestId('recipe-composer-header')).toBeInTheDocument();
    expect(screen.getByText('My recipe')).toBeInTheDocument();
    expect(screen.getByText('3/4')).toBeInTheDocument();
    expect(screen.getByText('Saved 2 min ago')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('recipe-composer-back'));
    fireEvent.click(screen.getByTestId('recipe-composer-save'));
    fireEvent.click(screen.getByTestId('recipe-composer-preview'));
    fireEvent.click(screen.getByTestId('recipe-composer-publish'));

    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it('disables publish and shows loading state when requested', () => {
    render(
      <ComposerHeader
        title="Draft"
        onBack={vi.fn()}
        completion={{ done: 1, total: 4, percent: 25 }}
        lastSavedLabel="Saving"
        onSave={vi.fn()}
        onPreview={vi.fn()}
        onPublish={vi.fn()}
        publishLoading
        submitLabel="Publish"
        isPublishDisabled
        publishTooltip="Missing fields"
      />,
    );

    const publishButton = screen.getByTestId('recipe-composer-publish');
    expect(publishButton).toBeDisabled();
    expect(publishButton).toHaveTextContent('Publish');
  });
});
