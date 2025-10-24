export type Props = {
  children: React.ReactNode;
};

// Recursive type for nested locale message objects
export type LocaleMessages = {
  [key: string]: string | LocaleMessages;
};

export type AllMessages = {
  [locale: string]: LocaleMessages;
};

export type ClientProvidersProps = Props & {
  messages: AllMessages;
  locale: string;
};
