import type { PropsWithChildren } from 'react';

export type Locale = 'en' | 'hu' | 'de';

// Recursive type for nested locale message objects
export type LocaleMessages = {
  [key: string]: string | LocaleMessages;
};

export type AllMessages = {
  [locale: string]: LocaleMessages;
};

export type ClientProvidersProps = PropsWithChildren & {
  messages: AllMessages;
  locale: string;
};
