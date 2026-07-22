import type { ChangeEventHandler, ReactNode } from 'react';

export type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  children?: ReactNode;
  [key: string]: unknown;
};

export type DivProps = React.ComponentPropsWithoutRef<'div'> & {
  children?: ReactNode;
  [key: string]: unknown;
};

export type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  children?: ReactNode;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  [key: string]: unknown;
};

export type ParagraphProps = React.ComponentPropsWithoutRef<'p'> & {
  children?: ReactNode;
  [key: string]: unknown;
};

export type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> & {
  children?: ReactNode;
  value?: string | number | readonly string[] | undefined;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  [key: string]: unknown;
};
