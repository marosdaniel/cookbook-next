export type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
  children?: React.ReactNode;
  [key: string]: unknown;
};

export type DivProps = React.ComponentPropsWithoutRef<'div'> & {
  children?: React.ReactNode;
  [key: string]: unknown;
};

export type InputProps = React.ComponentPropsWithoutRef<'input'> & {
  children?: React.ReactNode;
  value?: string | number | readonly string[] | undefined;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  [key: string]: unknown;
};

export type ParagraphProps = React.ComponentPropsWithoutRef<'p'> & {
  children?: React.ReactNode;
  [key: string]: unknown;
};

export type TextareaProps = React.ComponentPropsWithoutRef<'textarea'> & {
  children?: React.ReactNode;
  value?: string | number | readonly string[] | undefined;
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
  [key: string]: unknown;
};
