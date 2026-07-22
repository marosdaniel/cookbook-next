import type {
  ChangeEventHandler,
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
} from 'react';
import type {
  ButtonProps,
  DivProps,
  InputProps,
  ParagraphProps,
  TextareaProps,
} from '@/types/test';

export const ActionIcon = ({ children, ...props }: ButtonProps) => (
  <button {...props}>{children}</button>
);

export const Badge = ({ children, ...props }: ParagraphProps) => (
  <span {...props}>{children}</span>
);

export const Box = ({ children, ...props }: DivProps) => (
  <div {...props}>{children}</div>
);

export const Button = ({ children, ...props }: ButtonProps) => (
  <button {...props}>{children}</button>
);

export const Group = ({ children, ...props }: DivProps) => (
  <div {...props}>{children}</div>
);

export const MultiSelect = ({ value, onChange, ...props }: InputProps) => (
  <input
    value={String(value ?? '')}
    onChange={(event) => {
      const nextValue = event.target.value;
      (onChange as ((value: string[]) => void) | undefined)?.([nextValue]);
    }}
    onInput={(event) => {
      const nextValue = (event.target as HTMLInputElement).value;
      (onChange as ((value: string[]) => void) | undefined)?.([nextValue]);
    }}
    {...props}
  />
);

export const Select = ({ value, onChange, ...props }: InputProps) => (
  <input
    value={String(value ?? '')}
    onChange={(event) =>
      (onChange as ((value: string) => void) | undefined)?.(event.target.value)
    }
    onInput={(event) =>
      (onChange as ((value: string) => void) | undefined)?.(
        (event.target as HTMLInputElement).value,
      )
    }
    {...props}
  />
);

type ImageMockProps = ComponentPropsWithoutRef<'img'> & {
  alt?: string;
  [key: string]: unknown;
};

export const Image = ({ alt, ...props }: ImageMockProps) => {
  const {
    src,
    width,
    height,
    fallbackSrc,
    fit,
    h,
    w,
    radius,
    className,
    style,
    ...rest
  } = props as Record<string, unknown>;

  return (
    <div
      role="img"
      aria-label={alt}
      data-src={src as string | undefined}
      data-width={width as string | number | undefined}
      data-height={height as string | number | undefined}
      className={className as string | undefined}
      style={style as CSSProperties | undefined}
      {...rest}
    />
  );
};

export const Paper = ({ children, ...props }: DivProps) => (
  <div {...props}>{children}</div>
);

export const Stack = ({ children, ...props }: DivProps) => (
  <div {...props}>{children}</div>
);

export const Switch = ({ checked, onChange, ...props }: InputProps) => (
  <input
    type="checkbox"
    checked={Boolean(checked)}
    onChange={onChange as ChangeEventHandler<HTMLInputElement>}
    {...props}
  />
);

export const Text = ({ children, ...props }: ParagraphProps) => (
  <p {...props}>{children}</p>
);

export const Textarea = ({ value, onChange, ...props }: TextareaProps) => (
  <textarea
    value={value}
    onChange={onChange as ChangeEventHandler<HTMLTextAreaElement>}
    {...props}
  />
);

export const TextInput = ({
  value,
  onChange,
  rightSection,
  leftSection,
  ...props
}: InputProps & {
  rightSection?: ReactNode;
  leftSection?: ReactNode;
}) => (
  <div>
    <input
      value={value}
      onChange={onChange as ChangeEventHandler<HTMLInputElement>}
      {...props}
    />
    {leftSection}
    {rightSection}
  </div>
);

export const ThemeIcon = ({ children, ...props }: DivProps) => (
  <div {...props}>{children}</div>
);

export const Title = ({
  children,
  ...props
}: ComponentPropsWithoutRef<'h3'> & {
  children?: ReactNode;
  [key: string]: unknown;
}) => <h3 {...props}>{children}</h3>;

export const Tooltip = ({ children }: { children?: ReactNode }) => (
  <>{children}</>
);
